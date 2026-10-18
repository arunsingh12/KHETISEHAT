import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

/** For use in Server Components / layouts — redirects instead of throwing. */
export async function requireUser(allowed?: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (allowed && !allowed.includes(session.user.role)) redirect("/dashboard");
  return session.user;
}

/** For use in server actions — throws, so the caller can show a form error. */
export async function requireSession(allowed?: Role[]) {
  const session = await auth();
  if (!session?.user) throw new Error("You need to be logged in to do that");
  if (allowed && !allowed.includes(session.user.role)) {
    throw new Error("You don't have permission to do that");
  }
  return session.user;
}
