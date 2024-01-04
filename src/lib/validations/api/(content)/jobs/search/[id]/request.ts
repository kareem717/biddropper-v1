import * as z from "zod";

const getQueryParams = z.object({
	jobId: z.string().uuid(),
	fetchType: z.enum(["simple", "deep"]).optional().default("simple"),
});

export const queryParamsSchema = { GET: getQueryParams };
