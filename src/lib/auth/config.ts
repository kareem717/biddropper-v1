import { type GetServerSidePropsContext } from "next";
import {
	getServerSession,
	type NextAuthOptions,
	type DefaultSession,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import { db } from "@/db";
import { PlanetScaleAdapter } from "@/lib/auth/planet-scale-adapter";
import { Adapter } from "next-auth/adapters";
import { env } from "@/env.mjs";
import { users } from "@/db/schema/auth";
import { nanoid } from "nanoid";
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
	pages: {
		signIn: "/sign-in",
		signOut: "/sign-out",
		// error: '/auth/error',
		// verifyRequest: '/auth/verify-request',
		// newUser: '/auth/new-user'
	},
	providers: [
		GithubProvider({
			clientId: env["GITHUB_CLIENT_ID"],
			clientSecret: env["GITHUB_CLIENT_SECRET"],
			allowDangerousEmailAccountLinking: true,
		}),
		GoogleProvider({
			clientId: env["GOOGLE_CLIENT_ID"],
			clientSecret: env["GOOGLE_CLIENT_SECRET"],
			allowDangerousEmailAccountLinking: true,
		}),
	],
	callbacks: {
		async session({ session, user }) {
			return {
				...session,
				user: {
					...user,
				},
			};
		},
	},
};
