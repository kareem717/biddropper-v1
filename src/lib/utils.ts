import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/env.mjs";
import { isClerkAPIResponseError } from "@clerk/nextjs";
import { toast } from "sonner";
import * as z from "zod";
import { Clerk } from "@clerk/backend";
import { parse } from "url";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function catchClerkError(err: unknown) {
	const unknownErr = "Something went wrong, please try again later.";

	if (err instanceof z.ZodError) {
		const errors = err.issues.map((issue) => {
			return issue.message;
		});
		return toast(errors.join("\n"));
	} else if (isClerkAPIResponseError(err)) {
		return toast.error(err.errors[0]?.longMessage ?? unknownErr);
	} else {
		return toast.error(unknownErr);
	}
}

export const formatDate = (createdAt: Date): string => {
	const contractAge = Math.floor(
		(new Date().getTime() - new Date(createdAt).getTime()) / 1000 / 60 / 60 / 24
	);
	const suffix = contractAge > 1 ? "s" : "";
	if (contractAge < 1) {
		return "<1 day";
	} else if (contractAge < 7) {
		return `${contractAge} day${suffix}`;
	} else if (contractAge < 30) {
		const weeks = Math.floor(contractAge / 7);
		return `${weeks} week${suffix}`;
	} else if (contractAge < 365) {
		const months = Math.floor(contractAge / 30);
		return `${months} month${suffix}`;
	} else {
		const years = Math.floor(contractAge / 365);
		return `${years} year${suffix}`;
	}
};
