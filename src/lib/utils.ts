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

// export async function verifyAPIRequest(
// 	req?: Request,
// 	url?: string,
// 	parseSchema?: z.ZodObject<any>,
// 	options?: {
// 		unauthorizedMessage?: string;
// 		badRequestMessage?: string;
// 		endpointIdentifier?: string;
// 	}
// ): Promise<{ error?: Response; data?: Object }> {
// 	const { unauthorizedMessage, badRequestMessage, endpointIdentifier } =
// 		options ?? {
// 			unauthorizedMessage: undefined,
// 			badRequestMessage: undefined,
// 			endpointIdentifier: undefined,
// 		};

// 	if (unauthorizedMessage) {
// 		const session = await getServerSession(authOptions);

// 		if (!session) {
// 			return {
// 				error: new Response(unauthorizedMessage || "Unauthorized request.", {
// 					status: 401,
// 				}),
// 			};
// 		}
// 	}

// 	if (!req && !url && parseSchema) {
// 		return {
// 			error: new Response("Bad request.", {
// 				status: 400,
// 			}),
// 		};
// 	} else if (parseSchema && (url || req)) {
// 		let query;

// 		if (url) {
// 			query = { ...parse(url, true).query };
// 		}

// 		if (req) {
// 			query = { ...query, ...(await req.json()) };
// 		}

// 		const attmeptParse = parseSchema.safeParse(query);

// 		if (!attmeptParse.success) {
// 			console.log(`${endpointIdentifier} Error:`, attmeptParse.error);
// 			return {
// 				error: new Response(
// 					badRequestMessage || "Error parsing query parameters.",
// 					{ status: 400 }
// 				),
// 			};
// 		}

// 		return { data: attmeptParse.data };
// 	}

// 	return { data: undefined };
// }
