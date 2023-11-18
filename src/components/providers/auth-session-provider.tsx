"use client";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
export default function AuthSessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SessionProvider>{children}</SessionProvider>;
}
