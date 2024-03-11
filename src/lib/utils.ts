import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { gte, inArray, lte } from "drizzle-orm";
import { GetUserBidsInput } from "@/lib/validations/server/bids";

export const base64Regex =
  /^data:image\/[a-zA-Z+]*;base64,[a-zA-Z0-9+/]*={0,2}$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getExceptionType = (error: unknown) => {
  const UnknownException = {
    type: "UnknownException",
    status: 500,
    message: "An unknown error occurred",
  };

  if (!error) return UnknownException;

  if ((error as Record<string, unknown>).name === "DatabaseError") {
    return {
      type: "DatabaseException",
      status: 400,
      message: "Duplicate key entry",
    };
  }

  return UnknownException;
};

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

export function formatPrice(
  price: number | string,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: options.currency ?? "USD",
    notation: options.notation ?? "compact",
    ...options,
  }).format(Number(price));
}

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

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export const generateCursor = (
  lastItem: { [key: string]: any },
  orderBy: GetUserBidsInput["orderBy"],
  cursor: GetUserBidsInput["cursor"],
): GetUserBidsInput["cursor"] => {
  if (orderBy) {
    const { columnName, order } = orderBy;
    return {
      columnName,
      value: lastItem[columnName],
      order: order === "asc" ? "gte" : "lte",
    };
  } else if (cursor) {
    const { columnName, order } = cursor;

    return {
      columnName,
      value: lastItem[columnName],
      order,
    };
  } else {
    return {
      columnName: "id",
      value: lastItem.id,
      order: "gte",
    };
  }
};

export const APP_TITLE = "Acme";
export const DATABASE_PREFIX = "acme_v3";
export const EMAIL_SENDER = '"Acme" <noreply@acme.com>';

