import { db } from "@/db";
import { addresses } from "@/db/schema/address";
import { bundleMedia, bundles, jobs } from "@/db/schema/posts";
import { authOptions } from "@/lib/auth/config";
import { insertAddressSchema } from "@/lib/validations/address";
import {
	insertBundleMediaSchema,
	insertJobSchema,
} from "@/lib/validations/posts";
import { insertBundleSchema } from "@/lib/validations/posts";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
export async function POST(req: Request) {
	const { userId } = auth(); //TODO: switch to next auth when able
	if (!userId) return new Response("Unauthorized", { status: 401 });
	// [
	// 	{
	// 		fileKey: '6655a865-373a-431d-a4fe-348e36beb090_airbnb-icon.webp',
	// 		fileUrl:
	// 			'https://uploadthing.com/f/6655a865-373a-431d-a4fe-348e36beb090_airbnb-icon.webp'
	// 	}]
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
		// const testing = async () => {
		console.log('here')
		const res = await db.select().from(bundles).leftJoin(jobs, eq(bundles.id, jobs.bundleId));
		console.log(res)
		// return res
	// }

	return new Response(JSON.stringify(res), {
		status: 200,
	});
}

/** 
 * {
    title: 'kareeesdfsdf',
    description: 'fsdfsdfdsf',
    posterType: 'property-owner',
    bundleType: 'contractor-wanted',
    jobs: [
      {
        industry: 'closet-storage-solutions',
        title: 'sdfsdf',
        summary: 'sdfdsfsdf',
        budget: 324234,
        currencyType: 'usd',
        propertyType: 'residential',
        dateRange: {
          dateFrom: '2023-08-20T17:57:11.279Z',
          dateTo: '2023-08-31T04:00:00.000Z'
        }
      }
    ],
    address: {
      addressLine1: 'wqeqweqw',
      addressLine2: 'qweqweqwe',
      city: 'eqweqweqweqwe',
      region: 'qweqweqweqwe',
      postalCode: 'qweqweqweq',
      country: 'qweqweqweqwe'
    },
    showExactLocation: true
  }

 */
