import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { OAuthSignIn } from "@/components/auth/oauth-login";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <div className="inline-block animate-border rounded-[var(--radius)] bg-gradient-to-r from-primary/70 via-secondary to-primary/70 bg-[length:400%_400%] p-1 drop-shadow-xl">
      <Card className="p-3 py-5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>
            Choose your preferred authentication method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <OAuthSignIn />
        </CardContent>
      </Card>
    </div>
  );
}
