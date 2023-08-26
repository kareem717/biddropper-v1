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
      }
		}),
    GithubProvider({
      clientId: env["GITHUB_CLIENT_ID"],
      clientSecret: env["GITHUB_CLIENT_SECRET"],
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
        },
      }
    })
	],
	debug: env["NODE_ENV"] === "development",
	callbacks: {
    async session({ session, user }) {
			return {
				...session,
				user: {
					...user,
				},
			};
		},
		async jwt({ token, user }) {
			if (user) {
				const u = user as unknown as any;
				return {
					...token,
					id: u.id,
					name: u.name,
				};
			}
			return token;
		},
	},
};

export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext["req"];
	res: GetServerSidePropsContext["res"];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
