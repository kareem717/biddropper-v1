import * as z from "zod";
import { serviceCategories } from "@/config/services";

const serviceValues = serviceCategories.map((category) => category.value) as [
	string,
	...string[]
];

export const createCompanySchema = z.object({
	name: z.string().min(2).max(256),
	created_by: z
		.string()
		.min(5)
		.max(191)
		.regex(/^(user_)[a-zA-Z0-9-]*$/),
	private_metadata: z.object({}).optional(),
	public_metadata: z.object({}).optional(),
	services: z.enum(serviceValues).array().optional(),
	slug: z
		.string()
		.min(2)
		.max(300)
		.regex(/^[a-zA-Z0-9-]*$/),
	max_allowed_memberships: z.number().positive().int().optional().default(3),
	invitees: z
		.array(z.object({ email: z.string().email() }))
		.max(2, { message: "You can only invite 2 people to your company" })
		.optional(),
	tagline: z.string().min(2).max(120).optional(),
});
export type CreateCompanySchema = z.infer<typeof createCompanySchema>;
