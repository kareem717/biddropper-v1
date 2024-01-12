import { and, eq } from "drizzle-orm";
import crypto from "node:crypto";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/migrations/schema";
import { DBClient } from "@/db/client";
import type {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

export const defaultSchema = { users, accounts, sessions, verificationTokens };
export type DefaultSchema = typeof defaultSchema;
interface CustomSchema extends DefaultSchema {}
export function PlanetScaleAdapter(
  client: DBClient,
  _schema?: Partial<CustomSchema>,
): Adapter {
  return {
    createUser: async (data) => {
      const id = `user_${crypto.randomUUID()}`;
      await client.insert(users).values({ ...data, id });
      const user =
        ((await client
          .select()
          .from(users)
          .where(eq(users.id, id))
          .then((res) => res[0])) as AdapterUser) ?? null;
      return user;
    },
    getUser: async (data) => {
      const user =
        (await client
          .select()
          .from(users)
          .where(eq(users.id, data))
          .then((res) => res[0])) ?? null;
      return user;
    },
    getUserByEmail: async (data) => {
      const email =
        (await client
          .select()
          .from(users)
          .where(eq(users.email, data))
          .then((res) => res[0])) ?? null;
      return email;
    },
    createSession: async (data) => {
      await client.insert(sessions).values(data);

      const session =
        ((await client
          .select()
          .from(sessions)
          .where(eq(sessions.sessionToken, data.sessionToken))
          .then((res) => res[0])) as AdapterSession) ?? null;
      return session;
    },
    getSessionAndUser: async (data) => {
      const sessionAndUser =
        (await client
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .where(eq(sessions.sessionToken, data))
          .innerJoin(users, eq(users.id, sessions.userId))
          .then((res) => res[0])) ?? null;

      return sessionAndUser;
    },
    updateUser: async (data) => {
      if (!data.id) {
        throw new Error("No user id.");
      }

      await client.update(users).set(data).where(eq(users.id, data.id));
      const user =
        ((await client
          .select()
          .from(users)
          .where(eq(users.id, data.id))
          .then((res) => res[0])) as AdapterUser) ?? null;
      return user;
    },
    updateSession: async (data) => {
      await client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken));

      const session = await client
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .then((res) => res[0]);
      return session;
    },
    linkAccount: async (rawAccount) => {
      await client
        .insert(accounts)
        .values(rawAccount)
        .then((res) => res.rows[0]);
    },
    getUserByAccount: async (account) => {
      const dbAccount = await client
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        )
        .leftJoin(users, eq(accounts.userId, users.id))
        .then((res) => res[0]);

      return (dbAccount?.users as AdapterUser) ?? null;
    },
    deleteSession: async (sessionToken) => {
      await client
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken));
    },
    createVerificationToken: async (token) => {
      await client.insert(verificationTokens).values(token);

      return client
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.identifier, token.identifier))
        .then((res) => res[0]);
    },
    useVerificationToken: async (token) => {
      try {
        const deletedToken =
          (await client
            .select()
            .from(verificationTokens)
            .where(
              and(
                eq(verificationTokens.identifier, token.identifier),
                eq(verificationTokens.token, token.token),
              ),
            )
            .then((res) => res[0])) ?? null;

        await client
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token),
            ),
          );

        return deletedToken;
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    deleteUser: async (id) => {
      await client
        .delete(users)
        .where(eq(users.id, id))
        .then((res) => res.rows[0]);
    },
    unlinkAccount: async (account) => {
      await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider),
          ),
        );

      return undefined;
    },
  };
}
