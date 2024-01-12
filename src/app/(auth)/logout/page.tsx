import { LogOutButtons } from "@/components/auth/logout-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export default async function SignOutPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="inline-block animate-border rounded-[var(--radius)] bg-gradient-to-r from-primary/70 via-secondary to-primary/70 bg-[length:400%_400%] p-1 drop-shadow-xl">
      <Card className="p-3 py-5">
        <CardHeader>
          <CardTitle>Log out</CardTitle>
          <CardDescription>Are you sure you want to log out?</CardDescription>
        </CardHeader>
        <CardContent>
          <LogOutButtons />
        </CardContent>
      </Card>
    </div>
  );
}
