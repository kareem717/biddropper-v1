import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { gte, inArray, lte } from "drizzle-orm";

// Used for merging tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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




// function drizzleSchemaProperties(schema: any) {
// // src/server/api/validations/utils/generateZodEnumFromTable.ts
// import { z } from 'zod';
// import { bids } from '../../db/schema/tables/content';

// // Utility type to extract table column names as a union type
// type TableKeys<T> = keyof T;

// // Extracting keys from the bids table schema
// type BidKeys = TableKeys<typeof bids.columns>;

// // Utility function to convert the keys to a Zod enum
// function generateZodEnumFromTable<T extends string>(keys: T[]): z.ZodEnum<[T, ...T[]]> {
//   return z.enum(keys);
// }

// // Example usage: Dynamically creating a Zod enum schema for orderBy
// const bidKeysArray: BidKeys[] = Object.keys(bids.columns) as BidKeys[];
// const orderBySchema = generateZodEnumFromTable(bidKeysArray);
// }