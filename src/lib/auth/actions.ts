"use server";

import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { redirects } from "@/config/redirects";
import { validateRequest } from "@/lib/auth";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export const checkAuth = async () => {
  const { session } = await validateRequest();
  if (!session) {
    return redirect("/login");
  }
};

export async function logout(): Promise<{ error: string } | void> {
  const { session } = await validateRequest();

  if (!session) {
    return {
      error: "No session found",
    };
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect(redirects.afterLogout);
}

// export async function resendVerificationEmail(): Promise<{
//   error?: string;
//   success?: boolean;
// }> {
//   const { user } = await validateRequest();

//   if (!user) {
//     return redirect(redirects.toLogin);
//   }

//   try {
//     const [lastSent] = await db
//       .select({ expiresAt: verificationTokens.expiresAt })
//       .from(verificationTokens)
//       .where(eq(verificationTokens.userId, users.id))
//       .limit(1);

//     if (!lastSent) {
//       return { error: "No verification code found" };
//     }

//     if (isWithinExpirationDate(lastSent.expiresAt)) {
//       return {
//         error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
//       };
//     }

//     const verificationCode = await generateEmailVerificationCode(user.id);

//     await sendMail({
//       to: user.email,
//       subject: "Verify your account",
//       body: renderVerificationCodeEmail({ code: verificationCode }),
//     });

//     return { success: true };
//   } catch (err) {
//     return { error: "Failed to send verification email" };
//   }
// }

// export async function verifyEmail(
//   _: any,
//   formData: FormData,
// ): Promise<{ error: string } | void> {
//   const code = formData.get("code");

//   if (typeof code !== "string" || code.length !== 8) {
//     return { error: "Invalid code" };
//   }

//   const { user } = await validateRequest();

//   if (!user) {
//     return redirect(redirects.toLogin);
//   }

//   try {
//     await db.transaction(async (tx) => {
//       const [item] = await tx
//         .select()
//         .from(verificationTokens)
//         .innerJoin(users, eq(verificationTokens.userId, users.id))
//         .where(eq(verificationTokens.userId, user.id))
//         .limit(1);

//       if (!item || item.verification_tokens.token !== code)
//         throw new Error("Invalid code", {
//           cause: "custom",
//         });

//       await tx
//         .delete(verificationTokens)
//         .where(eq(verificationTokens.id, item.verification_tokens.id));

//       if (!isWithinExpirationDate(item.verification_tokens.expiresAt))
//         throw new Error("Verification code expired", {
//           cause: "custom",
//         });

//       if (item.users.email !== user?.email)
//         throw new Error("Email does not match", {
//           cause: "custom",
//         });

//       await lucia.invalidateUserSessions(user?.id);

//       await db
//         .update(users)
//         .set({ emailVerified: new Date() })
//         .where(eq(users.id, user.id));

//       return item;
//     });
//   } catch (err) {
//     if (err instanceof Error && err.cause === "custom") {
//       return { error: err.message };
//     }

//     return { error: "Failed to verify email" };
//   }

//   const session = await lucia.createSession(user.id, {});
//   const sessionCookie = lucia.createSessionCookie(session.id);
//   cookies().set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes,
//   );
//   redirect(redirects.afterLogin);
// }

// const timeFromNow = (time: Date) => {
//   const now = new Date();
//   const diff = time.getTime() - now.getTime();
//   const minutes = Math.floor(diff / 1000 / 60);
//   const seconds = Math.floor(diff / 1000) % 60;
//   return `${minutes}m ${seconds}s`;
// };

// async function generateEmailVerificationCode(userId: string): Promise<string> {
//   return await db.transaction(async (tx) => {
//     await tx
//       .delete(verificationTokens)
//       .where(eq(verificationTokens.userId, userId));

//     const token = generateRandomString(8, alphabet("0-9"));

//     await tx.insert(verificationTokens).values({
//       userId,
//       token,
//       expiresAt: createDate(new TimeSpan(10, "m")),
//     });

//     return token;
//   });
// }
