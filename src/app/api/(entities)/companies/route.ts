import { db } from "@/lib/db/client";
import { inArray, eq, and, gte, exists, sql, ne } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import {
  bodyParamSchema,
  queryParamSchema,
} from "@/lib/deprecated/validations/api/(entities)/companies/request";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "stream";
import { promisify } from "util";
import { createWriteStream } from "fs";
import { compressToEncodedURIComponent } from "lz-string";
import {
  addresses,
  bids,
  companies,
  industries,
  jobs,
  media,
} from "@/lib/db/schema/tables/content";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { CustomError } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import {
  bidsRelationships,
  industriesToCompanies,
  jobsRelationships,
} from "@/lib/db/schema/tables/relations/content";
import { env } from "@/lib/env.mjs";
import { parse } from "url";
import { text } from "stream/consumers";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });

  let reqBody;
  try {
    reqBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body." }),
      { status: 400 },
    );
  }

  const attemptBodyParse = await bodyParamSchema.POST.safeParseAsync({
    ownerId: session.user.id,
    ...reqBody,
  });

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { address, imageBase64, industryValues, ...companyData } =
    attemptBodyParse.data;

  // Make sure company name dosen't already exist
  try {
    const [contractNameExists] = await db
      .select({ name: companies.name })
      .from(companies)
      .where(eq(companies.name, companyData.name))
      .limit(1);

    if (contractNameExists) {
      return new Response(
        JSON.stringify({ error: "Contract name is taken." }),
        { status: 400 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "An error occured veryfing the company name." }),
      { status: 500 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      const newAddressId = uuidv4();
      try {
        // insert address
        await tx.insert(addresses).values({
          id: newAddressId,
          ...address,
        });
      } catch (err) {
        throw new CustomError("Error inserting address.", 500);
      }

      const supabaseClient = await getSupabaseClient();
      const newImageId = uuidv4();
      const fileType = imageBase64.split(";")[0]?.split("/")[1];

      if (!fileType || !["png", "jpeg", "jpg"].includes(fileType)) {
        throw new CustomError("Invalid image format.", 400);
      }

      const fileName = `${newImageId}.${fileType}`;

      // Convert base64 to Blob
      const base64Response = await fetch(imageBase64);
      const blob = await base64Response.blob();
      const { data, error } = await supabaseClient.storage
        .from("images")
        .upload(fileName, blob, {
          contentType: `image/${fileType}`,
        });

      if (error) {
        throw new CustomError("Error uploading image.", 500);
      }

      // Save url in db
      try {
        const url = new URL(env.SUPABASE_ENDPOINT);

        await tx.insert(media).values({
          id: newImageId,
          url: `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`,
        });
      } catch (err) {
        // Delete image from storage
        await supabaseClient.storage.from("images").remove([data?.path]);
        throw new CustomError("Error inserting image.", 500);
      }

      // insert company
      const newCompanyId = uuidv4();
      try {
        await tx.insert(companies).values({
          id: newCompanyId,
          ...companyData,
          addressId: newAddressId,
          imageId: newImageId,
        });
      } catch (error) {
        await supabaseClient.storage.from("images").remove([data?.path]);
        throw new CustomError("Error inserting company.", 500);
      }

      // Insert industry relations
      try {
        const industryIds = await db
          .select({ id: industries.id })
          .from(industries)
          .where(inArray(industries.value, industryValues))
          .limit(industryValues.length);

        if (industryIds.length !== industryValues.length) {
          throw new CustomError("Invalid industry values.", 400);
        }

        await tx.insert(industriesToCompanies).values(
          industryIds.map((industry) => ({
            companyId: newCompanyId,
            industryId: industry.id,
          })),
        );
      } catch (err) {
        throw new CustomError("Error inserting industry relations.", 500);
      }
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating company.";
    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(
    JSON.stringify({
      message: "Company successfully created.",
    }),
    { status: 201 },
  );
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.ownedCompanies.length < 1) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let reqBody;

  try {
    reqBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body." }),
      { status: 400 },
    );
  }
  const attemptBodyParse = bodyParamSchema.PATCH.safeParse({
    ...reqBody,
  });

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const {
    address,
    addedIndustryValues,
    deletedIndustryValues,
    imageBase64,
    id: companyId,
    ...newCompanyDetails
  } = attemptBodyParse.data;

  const userOwnsCompany = session.user.ownedCompanies.some(
    (company) => company.id === companyId,
  );

  if (!userOwnsCompany) {
    return new Response(
      JSON.stringify({ error: "User does not own the company." }),
      {
        status: 401,
      },
    );
  }

  // Update company details
  if (newCompanyDetails) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .update(companies)
          .set(newCompanyDetails)
          .where(eq(companies.id, companyId));
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "An error updating the company's details." }),
        { status: 500 },
      );
    }
  }

  // Update address
  if (address) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .update(addresses)
          .set(address)
          .where(
            inArray(
              addresses.id,
              db
                .select({ id: companies.addressId })
                .from(companies)
                .where(eq(companies.id, companyId)),
            ),
          );
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "An error updating the company's address." }),
        { status: 500 },
      );
    }
  }

  // Update image
  if (imageBase64) {
    try {
      const supabaseClient = await getSupabaseClient();
      const newImageId = uuidv4();
      const fileType = imageBase64.split(";")[0]?.split("/")[1];

      if (!fileType || !["png", "jpeg", "jpg"].includes(fileType)) {
        throw new CustomError("Invalid image format.", 400);
      }

      const fileName = `${newImageId}.${fileType}`;

      // Convert base64 to Blob
      const base64Response = await fetch(imageBase64);
      const blob = await base64Response.blob();
      const { data, error } = await supabaseClient.storage
        .from("images")
        .upload(fileName, blob, {
          contentType: `image/${fileType}`,
        });

      if (error) {
        throw new CustomError("Error uploading image.", 500);
      }

      // Save url in db
      const url = new URL(env.SUPABASE_ENDPOINT);
      const publicImagesUrl = `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`;

      try {
        await db.transaction(async (tx) => {
          await tx.insert(media).values({
            id: newImageId,
            url: publicImagesUrl,
          });

          await tx
            .delete(media)
            .where(
              eq(
                media.id,
                tx
                  .select({ imageId: companies.imageId })
                  .from(companies)
                  .where(eq(companies.id, companyId)),
              ),
            );

          await tx
            .update(companies)
            .set({ imageId: newImageId })
            .where(eq(companies.id, companyId));
        });
      } catch (err) {
        // Delete image from storage
        await supabaseClient.storage.from("images").remove([data?.path]);

        throw new CustomError("An error occured inserting the new image.", 500);
      }
    } catch (err) {
      const message =
        err instanceof CustomError
          ? (err as Error).message
          : "An error occured uploading the new company image.";
      return new Response(
        JSON.stringify({
          error: message,
        }),
        { status: err instanceof CustomError ? err.status : 500 },
      );
    }
  }

  // Delete industries
  if (deletedIndustryValues) {
    try {
      await db.transaction(async (tx) => {
        const industryIds = await tx
          .select({ id: industries.id })
          .from(industries)
          .where(inArray(industries.value, deletedIndustryValues))
          .limit(deletedIndustryValues.length);

        if (industryIds.length !== deletedIndustryValues.length) {
          throw new CustomError("Invalid industry values.", 400);
        }
        const industryIdStrings = industryIds.map((industry) => industry.id);
        await tx
          .delete(industriesToCompanies)
          .where(
            and(
              eq(
                industriesToCompanies.companyId,
                tx
                  .select({ id: companies.id })
                  .from(companies)
                  .where(eq(companies.id, companyId)),
              ),
              inArray(industriesToCompanies.industryId, industryIdStrings),
            ),
          );
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "An error occured deleting the company's industries.",
        }),
        { status: 500 },
      );
    }
  }

  // Add industries
  if (addedIndustryValues) {
    try {
      await db.transaction(async (tx) => {
        const industryIds = await tx
          .select({ id: industries.id })
          .from(industries)
          .where(
            and(
              inArray(industries.value, addedIndustryValues),
              ne(
                industries.id,
                db
                  .select({ value: industriesToCompanies.industryId })
                  .from(industriesToCompanies)
                  .where(eq(industriesToCompanies.companyId, companyId)),
              ),
            ),
          )
          .limit(addedIndustryValues.length);

        if (industryIds.length === 0) {
          return;
        } else if (industryIds.length !== addedIndustryValues.length) {
          throw new CustomError("Invalid industry values.", 400);
        }

        await tx.insert(industriesToCompanies).values(
          industryIds.map((industry) => ({
            companyId,
            industryId: industry.id,
          })),
        );
      });
    } catch (err) {
      const message =
        err instanceof CustomError
          ? (err as Error).message
          : "An error occured adding the company's industries.";
      return new Response(
        JSON.stringify({
          error: message,
        }),
        { status: err instanceof CustomError ? err.status : 500 },
      );
    }
  }

  return new Response(
    JSON.stringify({
      message: "Company successfully updated.",
    }),
    { status: 200 },
  );
}

export async function DELETE(req: Request) {
  const { query } = parse(req.url, true);

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const attemptQueryParse = queryParamSchema.DELETE.safeParse(query);

  if (!attemptQueryParse.success) {
    return new Response(
      JSON.stringify({
        error: attemptQueryParse.error.issues[0]?.message,
      }),
      { status: 400 },
    );
  }

  const { id } = attemptQueryParse.data;

  if (!session.user.ownedCompanies.some((company) => company.id === id)) {
    return new Response(
      JSON.stringify({
        error: "User unauthorized to delete company.",
      }),
      { status: 401 },
    );
  }

  // Make sure user owns the company
  try {
    const [companyExists] = await db
      .select({
        id: companies.id,
      })
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!companyExists) {
      return new Response(
        JSON.stringify({
          error: "The company does not exist.",
        }),
        { status: 404 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "A server side error occured.",
      }),
      {
        status: 500,
      },
    );
  }

  try {
    await db.transaction(async (tx) => {
      const [addressId] = await tx
        .delete(companies)
        .where(eq(companies.id, id))
        .returning({ addressId: companies.addressId });

      const [mediaUrl] = await tx
        .delete(media)
        .where(
          eq(
            media.id,
            tx
              .select({ imageId: companies.imageId })
              .from(companies)
              .where(eq(companies.id, id)),
          ),
        )
        .returning({ url: media.url });

      if (addressId && addressId.addressId) {
        await tx.delete(addresses).where(eq(addresses.id, addressId.addressId));
      }

      // Delete image from storage
      if (mediaUrl) {
        const supabaseClient = await getSupabaseClient();

        const { error } = await supabaseClient.storage
          .from("images")
          .remove([mediaUrl.url]);

        if (error) {
          throw new CustomError("Error deleting image.", 500);
        }
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error deleting company.",
      }),
      { status: 200 },
    );
  }

  return new Response("Company deleted", { status: 200 });
}
