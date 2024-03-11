import * as z from "zod";

export const githubLoginCallbackInput = z.object({
  url: z
    .string({
      required_error: "URL is required",
      invalid_type_error: "URL must be a string",
    })
    .url({
      message: "Invalid URL",
    }),
});
