import { google, lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  accounts,
  users,
  NewAccount,
  NewUser,
} from "@/lib/db/schema/tables/auth";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    cookies().get("google_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
      headers: { Location: "/login" },
    });
  }

  const tokens = await google.validateAuthorizationCode(
    code,
    storedCodeVerifier,
  );
  const googleUserResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  const googleUser: any = await googleUserResponse.json();

  console.log(googleUser);

  let existingAccount;
  try {
    [existingAccount] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, "github"),
          eq(accounts.providerId, googleUser.id),
        ),
      )
      .limit(1);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch account",
      }),
      {
        status: 500,
      },
    );
  }

  if (existingAccount) {
    let user;
    try {
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, existingAccount.userId))
        .limit(1);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch user",
        }),
        {
          status: 500,
        },
      );
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const session = await lucia.createSession(
      existingAccount.userId,
      {},
      { sessionId: uuidv4() },
    );

    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } else {
    try {
      const userId = uuidv4();

      await db.transaction(async (tx) => {
        // const githubUserEmailsResponse = await fetch(
        //   "https://api.github.com/user/emails",
        //   {
        //     headers: {
        //       Authorization: `Bearer ${tokens.accessToken}`,
        //     },
        //   },
        // );

        // if (!githubUserEmailsResponse.ok) {
        //   throw new Error("Failed to fetch user emails");
        // }

        // const githubUserEmails: { email: string; primary: boolean }[] =
        //   await githubUserEmailsResponse.json();
        // const [firstName, lastName] = githubUser.login.split(" ");
        // const primaryEmail = githubUserEmails.find(
        //   (email) => email.primary,
        // )?.email;

        const newAccount: NewAccount = {
          provider: "google",
          providerId: googleUser.id,
          userId: userId,
        };

        // if (!primaryEmail) {
        //   throw new Error("No primary email found");
        // }

        const newUser: NewUser = {
          id: userId,
          email: "",
          firstName: "",
          lastName: "",
          emailVerified: new Date(),
        };

        await tx.insert(accounts).values(newAccount);

        await tx.insert(users).values(newUser);
      });

      const session = await lucia.createSession(
        userId,
        {},
        { sessionId: uuidv4() },
      );

      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Failed to create account/user",
        }),
        {
          status: 500,
        },
      );
    }
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard",
    },
  });
}
