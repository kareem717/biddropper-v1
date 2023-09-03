import { type GetServerSidePropsContext } from "next";
import {
	getServerSession,
	type NextAuthOptions,
	type DefaultSession,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { db } from "@/db";
import { PlanetScaleAdapter } from "@/lib/auth/planet-scale-adapter";
import { Adapter } from "next-auth/adapters";
import { env } from "@/env.mjs";
import { companies } from "@/db/migrations/schema";
import { eq } from "drizzle-orm";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
		};
	}
}

export const authOptions: NextAuthOptions = {
	secret: env["NEXTAUTH_SECRET"],
	session: {
		strategy: "database",
		maxAge: 7 * 24 * 60 * 60,
		updateAge: 0,
		generateSessionToken: () => {
			return `sess_${crypto.randomUUID()}`;
		},
	},
	// @ts-ignore
	adapter: PlanetScaleAdapter(db),
	providers: [
		GoogleProvider({
			clientId: env["GOOGLE_CLIENT_ID"],
			clientSecret: env["GOOGLE_CLIENT_SECRET"],
			allowDangerousEmailAccountLinking: true,
			authorization: {
				params: {
					prompt: "consent",
				},
			},
		}),
		GithubProvider({
			clientId: env["GITHUB_CLIENT_ID"],
			clientSecret: env["GITHUB_CLIENT_SECRET"],
			allowDangerousEmailAccountLinking: true,
			authorization: {
				params: {
					prompt: "consent",
				},
			},
		}),
	],
	debug: env["NODE_ENV"] === "development",
	callbacks: {
		async session({ session, user }) {
			const companyList = await db
				.select()
				.from(companies)
				.where(eq(companies.ownerId, user.id));

			return {
				...session,
				user: {
					...user,
					ownedCompanies: companyList,
				},
			};
		},
	},
};

export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext["req"];
	res: GetServerSidePropsContext["res"];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
