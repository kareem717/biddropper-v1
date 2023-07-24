import { InferModel } from "drizzle-orm";
import { contracts } from "drizzle/schema";

export type EventType = "user.created" | "user.updated" | "user.deleted";

export type Event = {
	data: Record<string, unknown>;
	object: "event";
	type: EventType;
};

// Drizzle ORM
export type Contract = InferModel<typeof contracts>;
export type NewContract = Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>;