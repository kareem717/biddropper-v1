import { db } from "@/db";
// import { addresses } from "/drizzle/migrations/address";
// import { bundleMedia, bundles, jobs } from "/drizzle/migrations/posts";
import { authOptions } from "@/lib/auth";
import { insertAddressSchema } from "@/lib/validations/address";
import {
	insertBundleMediaSchema,
	insertJobSchema,
} from "@/lib/validations/posts";
import { insertBundleSchema } from "@/lib/validations/posts";
import { auth } from "@clerk/nextjs";
// import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { bids, bundleMedia, bundles, jobs } from "@/db/migrations/schema";
import { InferModel, eq } from "drizzle-orm";
import { addresses } from "@/db/migrations/schema";

export async function POST(req: Request) {
	const { userId } = auth(); //TODO: switch to next auth when able
	if (!userId) return new Response("Unauthorized", { status: 401 });

	const body = await req.json();

	const address_id = `addr_${crypto.randomUUID()}`;
	const bundle_id = `bndl_${crypto.randomUUID()}`;

	await db.transaction(async (tx) => {
		// Insert address
		const address = insertAddressSchema.safeParse({
			id: address_id,
			...body.address,
		});
		if (!address.success) {
			await tx.rollback();
			return new Response("Incorrect address details", {
				status: 400,
			});
		}
		await tx.insert(addresses).values(address.data);
		console.log(11);
		// Insert bundle
		const bundleDetails = insertBundleSchema.safeParse({
			userId,
			addressId: address_id,
			isActive: true,
			title: body.title,
			description: body.description,
			posterType: body.posterType,
			bundleType: body.bundleType,
			showExactLocation: body.showExactLocation,
		});
		if (!bundleDetails.success) {
			await tx.rollback();
			return new Response("Incorrect bundle details", {
				status: 400,
			});
		}
		await tx.insert(bundles).values({
			id: bundle_id,
			userId,
			title: body.title,
			description: body.description,
			posterType: body.posterType,
			bundleType: body.bundleType,
			addressId: address_id,
			showExactLocation: body.showExactLocation,
		});
		console.log(11);

		// Insert jobs
		const insertableJobs = body.jobs.map((job) => {
			let dateTo = null;
			if (job.dateRange.dateTo) {
				dateTo = new Date(job.dateRange.dateTo);
			}

			return insertJobSchema.safeParse({
				userId,
				bundleId: bundle_id,
				id: `job_${crypto.randomUUID()}`,
				dateFrom: new Date(job.dateRange.dateFrom),
				dateTo: dateTo,
				industry: job.industry,
				title: job.title,
				summary: job.summary,
				budget: String(job.budget),
				currencyType: job.currencyType,
				propertyType: job.propertyType,
			});
		});
		if (!insertableJobs.every((job) => job.success)) {
			await tx.rollback();
			return new Response("Incorrect job details", {
				status: 400,
			});
		}
		await tx.insert(jobs).values(insertableJobs.map((job) => job.data));
		console.log(11);

		// Insert photos

		if (body.images) {
			const insertablePhotos = body.images.map((photo) => {
				return insertBundleMediaSchema.safeParse({
					id: `photo_${crypto.randomUUID()}`,
					bundleId: bundle_id,
					fileKey: photo.fileKey,
					mediaUrl: photo.fileUrl,
				});
			});
			console.log(insertablePhotos);
			if (!insertablePhotos.every((photo) => photo.success)) {
				console.log(11);

				await tx.rollback();
				return new Response("Incorrect photo details", {
					status: 400,
				});
			}
			await tx
				.insert(bundleMedia)
				.values(insertablePhotos.map((photo) => photo.data));
			console.log(11);
		}
	});

	return new Response(`${body}`, {
		status: 200,
	});
}

export async function GET(req: Request) {
	const headersList = headers();
	const contractId = headersList.get("Contract-ID");
	// todo: implement single bundle fetch
	type Bundle = InferModel<typeof bundles>;
	type Job = InferModel<typeof jobs>;
	type Address = InferModel<typeof addresses>;
	type BundleMedia = InferModel<typeof bundleMedia>;
	type Bid = InferModel<typeof bids>;

	let query;
	if (contractId) {
		query = db
			.select()
			.from(bundles)
			.where(eq(bundles.id, contractId))
			.innerJoin(jobs, eq(jobs.bundleId, bundles.id))
			.innerJoin(addresses, eq(bundles.addressId, addresses.id))
			.leftJoin(bundleMedia, eq(bundles.id, bundleMedia.bundleId))
			.leftJoin(bids, eq(jobs.id, bids.jobId))
			.prepare();
	} else {
		query = db
			.select()
			.from(bundles)
			.innerJoin(jobs, eq(jobs.bundleId, bundles.id))
			.innerJoin(addresses, eq(bundles.addressId, addresses.id))
			.leftJoin(bundleMedia, eq(bundles.id, bundleMedia.bundleId))
			.leftJoin(bids, eq(jobs.id, bids.jobId))
			.prepare();
	}

	try {
		const data = await query.execute();

		const result = data.reduce<
			Record<
				string,
				{
					bundles: Bundle;
					jobs: Job[];
					addresses: Address;
					bundleMedia?: BundleMedia[];
					bids?: Bid[];
				}
			>
		>((acc, curr) => {
			if (curr) {
				const {
					bundles,
					jobs: job,
					addresses,
					bundle_media: file,
					bids,
				} = curr;

				if (acc[bundles.id]) {
					if (!acc[bundles.id]?.jobs.some((j) => j.id === job.id)) {
						acc[bundles.id]?.jobs.push(job);
					}
					if (
						file &&
						!acc[bundles.id]?.bundleMedia?.some((f) => f.id === file?.id)
					) {
						acc[bundles.id]?.bundleMedia?.push(file);
					}

					if (bids && !acc[bundles.id]?.bids?.some((b) => b.id === bids?.id)) {
						acc[bundles.id]?.bids?.push(bids);
					}
				} else {
					acc[bundles.id] = {
						bundles,
						jobs: [job],
						addresses,
						bundleMedia: file ? [file] : [],
						bids: bids ? [bids] : [],
					};
				}
			}
			return acc;
		}, {});

		return new Response(JSON.stringify(result), {
			status: 200,
		});
	} catch (err) {
		console.log(err);
		return new Response("Error", {
			status: 500,
		});
	}
}
