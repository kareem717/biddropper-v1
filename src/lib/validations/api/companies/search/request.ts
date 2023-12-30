import * as z from "zod";


const postBodyParams = z.object({
	companyIds: z
		.array(
			z
				.string()
				.max(50, {
					message: "Invalid identifier.",
				})
				.refine((id) => /^comp_[a-zA-Z0-9\-]{1,36}$/.test(id), {
					message: "Invalid identifier.",
				})
		).max(300, {
      message: "Too many identifiers. Max 300.",
    })
		.optional(),
	includeInactive: z
		.string()
		.optional()
		.transform((val) => val?.toLowerCase() === "true")
		.transform((bool) => (bool ? [true, false] : [true])),
	includeUnverified: z
		.string()
		.optional()
		.transform((val) => val?.toLowerCase() === "true")
		.transform((bool) => (bool ? [true, false] : [true])),
	industryValues: z
		.preprocess(
			(input) => (typeof input === "string" ? JSON.parse(input) : input),
			z.array(
				z.string().max(100, {
					message: "Invalid industry value.",
				})
			).max(250, {
				message: "Too many industry values. Max 250.",
			})
		)
		.optional(),
	serviceAreaFilter: z.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
	}).optional(),
	limit: z.number().optional().default(15),
	cursor: z
		.string()
		.max(50, {
			message: "Invalid cursor.",
		})
		.refine((id) => /^comp_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		})
		.optional(),
});


export const bodyParamSchema = {
	POST: postBodyParams,
};

