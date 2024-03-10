import { db } from "@/lib/db/client";
import { authOptions } from "@/lib/auth";
import {
  bodyParamSchema,
  queryParamSchema,
} from "@/lib/deprecated/validations/api/(entities)/users/request";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { parse } from "url";
import { account, user } from "@/lib/db/schema/tables/auth";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { CustomError } from "@/lib/utils";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const reqBody = await req.json();

  const attemptBodyParse = bodyParamSchema.PATCH.safeParse(reqBody);

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { id, ...updateValues } = attemptBodyParse.data;

  // Make sure user is updating their own profile
  if (id !== session.user.id) {
    return new Response("Unauthorized to update user.", { status: 401 });
  }

  // Update user profile
  try {
    const [updatedUser] = await db
      .update(user)
      .set(updateValues)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
      });

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error updating user." }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ message: "User updated." }), {
    status: 200,
  });
}

export async function DELETE(req: Request) {
  const { query } = parse(req.url, true);

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Input validation
  const params = queryParamSchema.DELETE.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  // Make sure user is deleting their own profile
  if (session.user.id !== params.data.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized to delete user." }),
      { status: 401 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      const [deletedUser] = await tx
        .delete(user)
        .where(eq(user.id, params.data.id))
        .returning({ id: user.id, image: user.image });

      if (!deletedUser) {
        return new Response("User not found.", { status: 404 });
      }

      // Delete user's image
      const sbClient = getSupabaseClient();
      const { error } = await sbClient.storage
        .from("images")
        .remove([`${deletedUser.image?.split("/")[-1]}.png`]);

      if (error) {
        throw new CustomError("Error deleting user image.", 500);
      }

      // Delete user's accounts
      await tx.delete(account).where(eq(account.userId, deletedUser.id));
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting user.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response("User deleted.", { status: 200 });
}

export async function GET(req: Request) {
  const { query } = parse(req.url, true);

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Input validation
  const params = queryParamSchema.GET.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  if (session.user.id === params.data.id) {
    // Return more data if user is fetching their own data
    try {
      const [returnUser] = await db
        .select({
          user,
          accounts: sql`json_agg(${account})`,
        })
        .from(user)
        .leftJoin(account, eq(user.id, account.userId))
        .where(eq(user.id, params.data.id))
        .groupBy(user.id)
        .limit(1);

      if (!returnUser) {
        return new Response("User not found.", { status: 404 });
      }

      return new Response(JSON.stringify(returnUser), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Error finding user." }), {
        status: 500,
      });
    }
  } else {
    try {
      const [returnUser] = await db
        .select({
          id: user.id,
          name: user.name,
          imageUrl: user.image,
          createAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, params.data.id))
        .limit(1);

      if (!returnUser) {
        return new Response("User not found.", { status: 404 });
      }

      return new Response(JSON.stringify(returnUser), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Error finding user." }), {
        status: 500,
      });
    }
  }
}
