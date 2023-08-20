"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { bundles, jobs } from "@/db/schema/posts";
import { eq } from "drizzle-orm";

export default function ContractPage() {
	async function apiCall() {

		const res = await fetch("/api/posts/bundles", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
	
		console.log(await res.json())	
	}

	apiCall()
	return (
		<main>
			<div className="flex flex-row gap-4 pt-[60px]">
				<a href="/contracts/create" className={buttonVariants()}>
					Create
				</a>
			</div>
		</main>
	);
}
