import { db } from "@/db";
// import { addresses } from "/drizzle/migrations/address";
import {
	createContractSchema,
	insertContractSchema,
} from "@/lib/validations/posts/posts";
import { authOptions } from "@/lib/auth";
import { insertAddressSchema } from "@/lib/validations/misc/address";
import { auth } from "@clerk/nextjs";
// import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { bids, contractJobs, contracts, jobs } from "@/db/migrations/schema";
import { InferModel, eq } from "drizzle-orm";
import { addresses } from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import * as z from "zod";

//TODO: Refactor for schema update
export async function POST(req: Request) {
	const session = await getServerSession(authOptions); //TODO: switch to next auth when able\
	if (!session) return new Response("Unauthorized", { status: 401 });

	const ownerId = headers().get("Owner-ID");
	const body = await req.json();
	console.log(body);

	try {
		const reqBody = createContractSchema.parse({
			endDate: new Date(body.endDate),
			...body,
		});

		const newID = `cntr_${crypto.randomUUID()}`;

		const contractValues = insertContractSchema.parse({
			id: newID,
			title: reqBody.title,
			description: reqBody.description,
			price: String(reqBody.price),
			endDate: reqBody.endDate,
		});

		const contractJobValues = reqBody.jobs.map((job) => {
			return {
				contractId: newID,
				jobId: job.id,
			};
		});

		await db.transaction(async (tx) => {
			// insert Contract
			await tx.insert(contracts).values({
				id: newID,
				title: reqBody.title,
				description: reqBody.description,
				price: Number(reqBody.price),
				endDate: reqBody.endDate,
			} as any);

			// Insert contract jobs
			await tx.insert(contractJobs).values(contractJobValues);
		});

		return new Response(
			JSON.stringify({
				id: newID,
			}),
			{
				status: 201,
			}
		);
	} catch (err) {
		return new Response(JSON.stringify(err), {
			status: 400,
		});
	}
}

// TODO: change so that u can do a full-table fetch or a simpler fetch
// export async function GET(req: Request) {
// 	const headersList = headers();
// 	const contractId = headersList.get("Contract-ID");
// 	const companyId = headersList.get("Company-ID");
// 	// todo: implement single bundle fetch
// 	type Bundle = InferModel<typeof contracts>;
// 	type Job = InferModel<typeof jobs>;
// 	type Address = InferModel<typeof addresses>;
// 	type Bid = InferModel<typeof bids>;

// 	let query;
// 	if (contractId) {
// 		query = db
// 			.select()
// 			.from(contracts)
// 			.where(eq(contracts.id, contractId))
// 			.innerJoin(jobs, eq(jobs.bundleId, contracts.id))
// 			.innerJoin(addresses, eq(contracts.addressId, addresses.id))
// 			.leftJoin(bundleMedia, eq(contracts.id, bundleMedia.bundleId))
// 			.leftJoin(bids, eq(jobs.id, bids.jobId))
// 			.prepare();
// 	} else if (companyId) {
// 		query = db
// 			.select()
// 			.from(contracts)
// 			.innerJoin(jobs, eq(jobs.bundleId, contracts.id))
// 			.innerJoin(addresses, eq(contracts.addressId, addresses.id))
// 			.leftJoin(bundleMedia, eq(contracts.id, bundleMedia.bundleId))
// 			.leftJoin(bids, eq(jobs.id, bids.jobId))
// 			.prepare();
// 	}
// 	}else {
// 		query = db
// 			.select()
// 			.from(contracts)
// 			.innerJoin(jobs, eq(jobs.bundleId, contracts.id))
// 			.innerJoin(addresses, eq(contracts.addressId, addresses.id))
// 			.leftJoin(bundleMedia, eq(contracts.id, bundleMedia.bundleId))
// 			.leftJoin(bids, eq(jobs.id, bids.jobId))
// 			.prepare();
// 	}

// 	try {
// 		const data = await query.execute();

// 		const result = data.reduce<
// 			Record<
// 				string,
// 				{
// 					contracts: Bundle;
// 					jobs: Job[];
// 					addresses: Address;
// 					bids?: Bid[];
// 				}
// 			>
// 		>((acc, curr) => {
// 			if (curr) {
// 				const {
// 					contracts,
// 					jobs: job,
// 					addresses,
// 					bids,
// 				} = curr;

// 				if (acc[contracts.id]) {
// 					if (!acc[contracts.id]?.jobs.some((j) => j.id === job.id)) {
// 						acc[contracts.id]?.jobs.push(job);
// 					}

// 					if (bids && !acc[contracts.id]?.bids?.some((b) => b.id === bids?.id)) {
// 						acc[contracts.id]?.bids?.push(bids);
// 					}
// 				} else {
// 					acc[contracts.id] = {
// 						contracts,
// 						jobs: [job],
// 						addresses,
// 						bids: bids ? [bids] : [],
// 					};
// 				}
// 			}
// 			return acc;
// 		}, {});

// 		return new Response(JSON.stringify(result), {
// 			status: 200,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 		return new Response("Error", {
// 			status: 500,
// 		});
// 	}
// }
