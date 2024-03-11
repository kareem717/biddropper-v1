import { generateState } from "arctic";
import { cookies } from "next/headers";
import { github } from "@/lib/auth";
import { env } from "@/lib/env.mjs";

export async function GET(): Promise<Response>  {
  const state = generateState();
  const url = await github.createAuthorizationURL(state, {
    scopes: ["identify", "user:email"],
  });

  cookies().set("github_oauth_state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return Response.redirect(url);
};