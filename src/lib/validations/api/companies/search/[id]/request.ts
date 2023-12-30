import * as z from "zod";

const getQueryParams = z.object({
	fetchType: z.enum(["simple", "deep"]).optional().default("simple"),
});

export const queryParamSchema = {
	GET: getQueryParams,
};
