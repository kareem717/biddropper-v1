"use client";

import { useState } from "react";
import { toast } from "sonner"

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

import { signIn } from "next-auth/react";
import { OAuthProviderType } from "next-auth/providers";
import { redirect } from "next/navigation";

const oauthProviders = [
	{ name: "Google", strategy: "google", icon: "google" },
	{ name: "Github", strategy: "github", icon: "github" },
] satisfies {
	name: string;
	icon: keyof typeof Icons;
	strategy: OAuthProviderType;
}[];

export function OAuthSignIn() {
	const [isLoading, setIsLoading] = useState<OAuthProviderType | null>(null);

	async function oauthSignIn(provider: OAuthProviderType) {
		setIsLoading(provider);
		const res = await signIn(provider);
		console.log(res)

	}

	return (
		<div className="grid grid-cols-1 gap-2">
			{oauthProviders.map((provider) => {
				const Icon = Icons[provider.icon];

				return (
					<Button
						aria-label={`Sign in with ${provider.name}`}
						key={provider.strategy}
						onClick={() => void oauthSignIn(provider.strategy)}
						disabled={isLoading !== null}
					>
						{isLoading === provider.strategy ? (
							<Icons.spinner
								className="mr-2 h-4 w-4 animate-spin"
								aria-hidden="true"
							/>
						) : (
							<Icon className="mr-2 h-4 w-4" aria-hidden="true" />
						)}
						{provider.name}
					</Button>
				);
			})}
		</div>
	);
}