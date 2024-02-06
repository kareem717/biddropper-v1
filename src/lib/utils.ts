import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isClerkAPIResponseError } from "@clerk/nextjs";
import { toast } from "sonner";
import * as z from "zod";
import { init } from "@paralleldrive/cuid2";
import { gte, inArray, lte } from "drizzle-orm";

// Used for merging tailwind classes
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

// Used for formatting the date on the job cards
export const formatDate = (createdAt: Date): string => {
  const contractAge = Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) /
      1000 /
      60 /
      60 /
      24,
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

// Genenralized function foe the bids API endpoints, doubt I'll use this anywhere other than there
export const createFilterConditions = (params: any, bids: any) => {
  const { data } = params;
  const conditions = [
    inArray(bids.status, data.status),
    inArray(bids.isActive, data.isActive),
  ];

  const addCondition = (conditionFn: Function, field: any, value: any) => {
    if (value) {
      conditions.push(conditionFn(field, value));
    }
  };

  addCondition(gte, bids.price, data.minPrice);
  addCondition(lte, bids.price, data.maxPrice);
  addCondition(gte, bids.createdAt, data.minCreatedAt);
  addCondition(lte, bids.createdAt, data.maxCreatedAt);
  addCondition(gte, bids.id, data.cursor);

  return conditions;
};

export class CustomError extends Error {
  status?: number;

  constructor(message?: string, status?: number) {
    super(message);
    this.name = "CustomError";
    this.status = status;
  }
}

export const base64Regex =
  /^data:image\/[a-zA-Z+]*;base64,[a-zA-Z0-9+/]*={0,2}$/;

function base64ImageSize(base64String: string) {
  // Remove data URL prefix and extract base64 part
  const base64Parts = base64String.split(",");

  const base64Part = base64Parts[1];

  if (!base64Part) {
    throw new Error("Invalid base64 string");
  }

  // Calculate the byte size
  const byteSize = (base64Part.length * 3) / 4;
  // Convert to kilobytes
  const sizeInMb = byteSize / 1024 / 1024;

  return sizeInMb;
}

