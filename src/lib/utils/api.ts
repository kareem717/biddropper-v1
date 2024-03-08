import { GetUserBidsInput } from "@/server/api/validations/bids";

export const base64Regex =
  /^data:image\/[a-zA-Z+]*;base64,[a-zA-Z0-9+/]*={0,2}$/;

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
