"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useState } from "react";

export function LogOutButtons() {
  const router = useRouter();
  const [isPending, setPending] = useState<boolean>(false);

  const handleSignOut = async () => {
    setPending(true);

    //TODO: change to trpc
    const response = await fetch("/api/sign-out", {
      method: "POST",
      redirect: "manual",
    });

    if (response.status === 0) {
      // redirected
      // when using `redirect: "manual"`, response status 0 is returned
      return router.refresh();
    }

    setPending(false);
  };

  return (
    <div className="flex w-full items-center space-x-2">
      <Button
        aria-label="Log out"
        size="sm"
        className="w-full"
        disabled={isPending}
        onClick={handleSignOut}
      >
        {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Log out
      </Button>

      <Button
        aria-label="Go back to the previous page"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => router.back()}
        disabled={isPending}
      >
        Go back
      </Button>
    </div>
  );
}
