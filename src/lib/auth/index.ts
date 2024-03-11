import { cache } from "react";
import { GitHub, Google, Discord, generateState } from "arctic";
import { Lucia, TimeSpan, type User, type Session } from "lucia";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, sessions, NewUser } from "@/lib/db/schema/tables/auth";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { env } from "@/lib/env.mjs";

const IS_DEV = env.NODE_ENV === "development" ? "DEV" : "PROD";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export interface DatabaseUserAttributes
  extends Omit<NewUser, "hashedPassword"> {}

export interface DatabaseSessionAttributes {}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "session",
    expires: false,
    attributes: {
      secure: !IS_DEV,
    },
  },
  getUserAttributes: (databaseUserAttributes) => {
    return {
      firstName: databaseUserAttributes.firstName,
      lastName: databaseUserAttributes.lastName,
      image: databaseUserAttributes.image,
      email: databaseUserAttributes.email,
    };
  },
});

const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);
  
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {}
  return result;
};

export const validateRequest = cache(uncachedValidateRequest);

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
);

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "/login/google/callback",
);
