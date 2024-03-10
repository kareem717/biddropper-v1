import * as z from "zod";

const getQueryParams = z.object({
  companyId: z.string().uuid(),
  fetchType: z.enum(["simple", "deep"]).optional().default("simple"),
});

export const queryParamSchema = {
  GET: getQueryParams,
};
