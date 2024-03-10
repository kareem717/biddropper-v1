"use client";

import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const oauthProviders = [
  { name: "Google", strategy: "google", icon: "google" },
  { name: "Github", strategy: "github", icon: "github" },
] satisfies {
  name: string;
  strategy: string;
  icon: keyof typeof Icons;
}[];

export const OAuthForm = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const oauthSignIn = async (provider: (typeof oauthProviders)[number]) => {
    setIsLoading(provider.strategy);

    try {
			await signIn(provider.strategy);
			router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `There was an error signing in with ${provider.name}.`,
      });
    }

    setIsLoading(null);
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {oauthProviders.map((provider) => {
        const Icon = Icons[provider.icon];
        return (
          <Button
            aria-label={`Sign in with ${provider.name}`}
            key={provider.strategy}
            onClick={() => void oauthSignIn(provider)}
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
};