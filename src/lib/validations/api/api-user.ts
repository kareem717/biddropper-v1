import { insertUserSchema } from "../entities/user";
import * as z from "zod";

export const updateUserSchema = z.object({
	id: insertUserSchema.shape.id,
	name: insertUserSchema.shape.name,
});
