"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isSmsConfigured, sendSms } from "@/lib/sms";
import { registerSchema, requestPasswordResetSchema, resetPasswordSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export async function registerUser(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    identifier: formData.get("identifier"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }
  const { name, email, phone, password, role } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) as never },
  });
  if (existing) {
    return { ok: false, error: "An account with that phone/email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role },
  });

  if (role === "PROVIDER") {
    await prisma.providerProfile.create({
      data: {
        userId: user.id,
        displayName: name,
        section: "AGRI",
        location: "",
        phone: phone ?? "",
        verified: false,
      },
    });
  }

  redirect("/login?registered=1");
}

export type PasswordResetResult = ActionResult & { resetLink?: string };

export async function requestPasswordReset(
  _prevState: PasswordResetResult | null,
  formData: FormData,
): Promise<PasswordResetResult> {
  const parsed = requestPasswordResetSchema.safeParse({ identifier: formData.get("identifier") });
  if (!parsed.success) {
    return { ok: false, error: "Enter your phone number or email" };
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.identifier }, { phone: parsed.data.identifier }] },
  });
  // Always return success even if no account matches, so this can't be used
  // to enumerate registered phone numbers/emails.
  if (!user) return { ok: true };

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const resetLink = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password/${token}`;

  // The link goes only to the account's own phone. Showing it on the page
  // would let anyone who knows a phone number take over that account — so
  // that's allowed only in local development when SMS isn't set up.
  const sent = await sendSms(user.phone, `Kheti Sehat: reset your password (valid 1 hour): ${resetLink}`);
  if (!sent && !isSmsConfigured() && process.env.NODE_ENV !== "production") {
    console.log(`[password reset] ${user.email ?? user.phone}: ${resetLink}`);
    return { ok: true, resetLink };
  }
  return { ok: true };
}

export async function resetPassword(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/login?reset=1");
}
