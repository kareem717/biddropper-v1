// import { db } from "@/db/client";
// import { insertContractSchema } from "@/lib/validations/posts/contracts";
// import {
//   createContractSchema,
//   deleteContractQuerySchema,
//   fetchContractsQuerySchema,
//   updateContractSchema,
// } from "@/lib/validations/api/api-contract";
// import { authOptions } from "@/lib/auth";
// import {
//   bids,
//   companies,
//   companyJobs,
//   contractBids,
//   contractJobs,
//   contracts,
//   jobMedia,
//   jobs,
//   media,
// } from "@/db/migrations/schema";
// import {
//   and,
//   eq,
//   inArray,
//   exists,
//   sql,
//   gt,
//   gte,
//   or,
//   isNull,
// } from "drizzle-orm";
// import { getServerSession } from "next-auth";
// import { parse } from "url";
// import fullContractView from "@/db/views/full-contract";
// import companyContractsView from "@/db/views/company-contracts";

// // TODO: Test all endpoints
// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session || session.user.ownedCompanies.length < 1) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   let reqBody = await req.json();

//   const attemptBodyParse = createContractSchema.safeParse(reqBody);

//   if (!attemptBodyParse.success) {
//     console.log("POST /api/contracts Error:", attemptBodyParse.error);
//     return new Response("Error parsing request body.", { status: 400 });
//   }

//   reqBody = attemptBodyParse.data;

//   const newID = `cntr_${crypto.randomUUID()}`;
//   const { reqJobs, ...reqContract } = reqBody;

//   const contractValueParse = insertContractSchema.safeParse({
//     id: newID,
//     ...reqContract,
//   });

//   if (!contractValueParse.success) {
//     console.log("POST /api/contracts Error:", contractValueParse.error);
//     return new Response("An error occureed while parsing the request body.", {
//       status: 400,
//     });
//   }

//   const contractValues = contractValueParse.data;

//   const contractJobValues = reqJobs.map((job: any) => {
//     return {
//       contractId: newID,
//       jobId: job.id,
//     };
//   });

//   try {
//     await db.transaction(async (tx) => {
//       // insert Contract
//       await tx.insert(contracts).values({
//         ...contractValues,
//         id: newID,
//       });

//       // Insert contract jobs
//       await tx.insert(contractJobs).values(contractJobValues);
//     });
//   } catch (err) {
//     console.log("POST /api/contracts Error:", err);
//     return new Response("An error occured creating the contract.", {
//       status: 500,
//     });
//   }

//   return new Response("Contract created successfully.", {
//     status: 201,
//   });
// }

// export async function GET(req: Request) {
//   const { query } = parse(req.url, true);
//   console.log(query);
//   const attemptBodyParse = fetchContractsQuerySchema.safeParse(query);

//   if (!attemptBodyParse.success) {
//     console.log("GET /api/contracts Error:", attemptBodyParse.error);
//     return new Response("Error parsing request body.", { status: 400 });
//   }

//   const { companyId, contractId, fetchType, getInactive, limit, cursor } =
//     attemptBodyParse.data;

//   let queryBuilder;

//   switch (fetchType) {
//     // Simple fetch obly gets the contract data
//     case "simple":
//       queryBuilder = db
//         .selectDistinct({
//           contracts,
//           bidCount: sql`COUNT(distinct ${contractBids.bidId})`,
//           jobCount: sql`COUNT(distinct ${contractJobs.jobId})`,
//           companyCount: sql`COUNT(distinct ${companyJobs.companyId})`,
//         })
//         .from(fullContractView)
//         .innerJoin(contracts, eq(contracts.id, fullContractView.contractId))
//         .leftJoin(contractBids, eq(contractBids.contractId, contracts.id))
//         .innerJoin(contractJobs, eq(contractJobs.contractId, contracts.id))
//         .innerJoin(companyJobs, eq(companyJobs.jobId, contractJobs.jobId))
//         .orderBy(contracts.id)
//         .groupBy(contracts.id);

//       break;

//     // Deep fetch gets the contract data, job data, and media data
//     case "deep":
//       queryBuilder = db
//         .select({
//           contracts,
//           jobs,
//           media,
//           bids,
//           companyCount: sql`COUNT(distinct ${companyJobs.companyId})`,
//           companyName: companies.name, // Add this line
//         })
//         .from(fullContractView)
//         .innerJoin(contracts, eq(contracts.id, fullContractView.contractId))
//         .innerJoin(jobs, eq(jobs.id, fullContractView.jobId))
//         .innerJoin(companyJobs, eq(companyJobs.jobId, jobs.id))
//         .innerJoin(companies, eq(companies.id, companyJobs.companyId)) // Add this line
//         .leftJoin(media, eq(media.id, fullContractView.mediaId))
//         .leftJoin(contractBids, eq(contractBids.contractId, contracts.id))
//         .leftJoin(bids, eq(bids.id, contractBids.bidId))
//         .orderBy(contracts.id)
//         .groupBy(contracts.id, companies.name, jobs.id, media.id, bids.id); // Add companies.name here
//       break;

//     // Minimal fetch only gets the data provided by the view
//     case "minimal":
//       queryBuilder = db
//         .select({
//           contracts: { id: fullContractView.contractId },
//           jobs: fullContractView.jobId,
//           media: fullContractView.mediaId,
//         })
//         .from(fullContractView)
//         .orderBy(contracts.id);
//       break;
//   }

//   if (!queryBuilder) {
//     return new Response("Invalid 'fetchType'.", { status: 400 });
//   }

//   // Apply filtering to query if needed
//   if (fetchType !== "minimal") {
//     if (!getInactive) {
//       queryBuilder = queryBuilder.where(
//         and(
//           eq(contracts.isActive, 1),
//           or(gt(contracts.endDate, sql`NOW()`), isNull(contracts.endDate)),
//         ),
//       );
//     }

//     if (contractId) {
//       queryBuilder = queryBuilder.where(eq(contracts.id, contractId));
//     }
//   }

//   if (companyId) {
//     queryBuilder = queryBuilder.where(
//       exists(
//         db
//           .select()
//           .from(companyContractsView)
//           .where(
//             and(
//               eq(companyContractsView.companyId, companyId),
//               eq(
//                 companyContractsView.contractId,
//                 sql`full_contract_view.contract_id`,
//               ), // Weird work around to to make this query work
//             ),
//           ),
//       ),
//     );
//   }

//   if (cursor) {
//     queryBuilder = queryBuilder.where(gte(contracts.id, cursor));
//   }

//   try {
//     console.log(queryBuilder.limit(contractId ? 1 : limit + 1).toSQL());
//     // Limit the number of results (defaults to 25)

//     let dbQuery = await queryBuilder.limit(contractId ? 1 : limit + 1);
//     let nextCursor = null;

//     if (!contractId) {
//       if (dbQuery.length > limit) {
//         nextCursor = dbQuery[dbQuery.length - 1]?.contracts.id;
//         dbQuery = dbQuery.slice(0, -1);
//       }
//     }

//     console.log(dbQuery);

//     // @ts-ignore
//     const res = dbQuery.reduce((acc: any, curr: any) => {
//       // If the contract doesn't exist, create it
//       if (!acc.find((contract: any) => contract.id === curr.contracts.id)) {
//         // console.log("Creating contract");
//         acc.push({
//           ...curr.contracts,
//           jobCount: curr.jobCount,
//           companyCount: curr.companyCount,
//           bidCount: curr.bidCount,
//           jobs: curr.jobs ? [curr.jobs] : [],
//           media: curr.media ? [curr.media] : [],
//           bids: curr.bids ? [curr.bids] : [],
//         });
//       } else {
//         // If the contract exists, add the job and media
//         const contractIndex = acc.findIndex(
//           (contract: any) => contract.id === curr.contracts.id,
//         );

//         if (curr.jobs) {
//           acc[contractIndex].jobs.push(curr.jobs);
//         }

//         if (curr.media) {
//           acc[contractIndex].media.push(curr.media);
//         }

//         if (curr.bids) {
//           acc[contractIndex].bids.push(curr.bids);
//         }
//       }

//       return acc;
//     }, []);

//     return new Response(
//       JSON.stringify({
//         data: res,
//         nextCursor,
//       }),
//       { status: 200 },
//     );
//   } catch (err) {
//     console.log("GET /api/contracts Error:", err);
//     return new Response("An error occured fetching the contract(s)", {
//       status: 500,
//     });
//   }
// }

// export async function PATCH(req: Request) {
//   const { query } = parse(req.url, true);

//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   const reqBody = await req.json();

//   const attemptBodyParse = updateContractSchema.safeParse({
//     id: query.id,
//     ...reqBody,
//   });

//   if (!attemptBodyParse.success) {
//     console.log("PATCH /api/contracts Error:", attemptBodyParse.error);
//     return new Response("Error parsing request body or query parameters.", {
//       status: 400,
//     });
//   }

//   const { id, removedJobs, newJobs, ...updateValues } = attemptBodyParse.data;

//   //Make sure user owns the contract
//   try {
//     const userOwnsContract = await db
//       .select()
//       .from(companyContractsView)
//       .where(eq(contracts.id, id))
//       .innerJoin(companies, eq(companies.ownerId, session.user.id))
//       .limit(1);

//     if (userOwnsContract.length < 1) {
//       return new Response("User does not own the contract.", { status: 401 });
//     }
//   } catch (err) {
//     console.log("PATCH /api/contracts Error:", err);
//     return new Response("Error verifying contract ownership.", { status: 500 });
//   }

//   // Delete jobs
//   if (removedJobs) {
//     try {
//       await db
//         .delete(contractJobs)
//         .where(
//           and(
//             eq(contractJobs.contractId, id),
//             inArray(contractJobs.jobId, removedJobs),
//           ),
//         );
//     } catch (err) {
//       console.log("PATCH /api/contracts Error:", err);
//       return new Response("Error deleting jobs.", { status: 500 });
//     }
//   }

//   // Insert jobs
//   if (newJobs) {
//     try {
//       // Link new jobs to contract
//       await db.insert(contractJobs).values(
//         newJobs.map((jobId) => ({
//           contractId: id,
//           jobId,
//         })),
//       );
//     } catch (err) {
//       console.log("PATCH /api/contracts Error:", err);
//       return new Response("An error occured while inserting new jobs.", {
//         status: 400,
//       });
//     }
//   }

//   // Update contract
//   try {
//     await db.update(contracts).set(updateValues).where(eq(contracts.id, id));
//   } catch (err) {
//     console.log("PATCH /api/contracts Error:", err);
//     return new Response("Error updating contract.", { status: 500 });
//   }

//   return new Response("Contract updated successfully.", { status: 200 });
// }

// export async function DELETE(req: Request) {
//   const { query } = parse(req.url, true);
//   const validParameters = deleteContractQuerySchema.safeParse(query);

//   if (!validParameters.success) {
//     console.log("DELETE /api/contracts Error:", validParameters.error);
//     return new Response("Invalid query parameters.", { status: 400 });
//   }

//   const { contractId } = validParameters.data;

//   try {
//     // Start a transaction
//     await db
//       .update(contracts)
//       .set({ isActive: 0 })
//       .where(eq(contracts.id, contractId));
//   } catch (err) {
//     console.log("DELETE /api/contracts Error:", err);
//     return new Response("Error deleting contract.", { status: 500 });
//   }

//   return new Response("Contract deleted successfully.", { status: 200 });
// }
