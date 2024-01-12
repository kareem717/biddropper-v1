import { InferModel } from "drizzle-orm";
import { contracts } from "drizzle/schema";

export type ClerkWebhookEvent = {
  data: Record<string, unknown>;
  object: "event";
  type: string;
};

// Drizzle ORM
export type Contract = InferModel<typeof contracts>;
export type NewContract = Omit<Contract, "id" | "createdAt" | "updatedAt">;

export type Option = {
  label: string;
  value: string;
};

export type GroupOptions = Record<string, Option[]>;
