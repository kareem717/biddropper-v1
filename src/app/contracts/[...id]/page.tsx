import * as React from "react";
import { db } from "@/db";
import { bids, bundleMedia, bundles, jobs } from "@/db/schema/posts";
import { InferModel, eq } from "drizzle-orm";
import { addresses } from "@/db/schema/address";
import { env } from "@/env.mjs";
export default async function ContractPage({
	params,
}: {
	params: { id: string };
}) {
	const res = await fetch(`${env["NEXT_PUBLIC_APP_URL"]}/api/posts/bundles`, {
		method: "GET",
		headers: {
			"Contract-ID": params.id,
		},
	});

	console.log("Response:", res);
	// cons
		const data =  await res.json();
		console.log("Response data:", data);


	return (
		<main>
			<div>My Post: {params.id}</div>
		</main>
	);
}

