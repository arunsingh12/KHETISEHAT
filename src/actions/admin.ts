"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { markPayoutPaid, PayoutNotPendingError } from "@/lib/escrow";
import {
  hospitalSchema,
  setCommissionRateSchema,
  markPayoutPaidSchema,
  updateUserRoleSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/** Promote/demote a user between Farmer, Provider, Coordinator, Admin. */
export async function updateUserRoleAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireSession(["ADMIN"]);
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  if (parsed.data.userId === admin.id && parsed.data.role !== "ADMIN") {
    return { ok: false, error: "You can't remove your own admin access" };
  }

  await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } });
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Fire-and-forget enable/disable toggle — plain `<form action>`, no inline feedback needed. */
export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  const admin = await requireSession(["ADMIN"]);
  const userId = String(formData.get("userId") ?? "");
  const active = formData.get("active") === "true";

  if (userId === admin.id && !active) {
    throw new Error("You can't disable your own account");
  }

  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}

/** Admin has paid the provider themselves (bank/UPI) — record it with the reference. */
export async function markPayoutPaidAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireSession(["ADMIN"]);
  const parsed = markPayoutPaidSchema.safeParse({
    bookingId: formData.get("bookingId"),
    method: formData.get("method"),
    reference: formData.get("reference"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  try {
    await markPayoutPaid(parsed.data.bookingId, {
      method: parsed.data.method,
      reference: parsed.data.reference,
      adminId: admin.id,
    });
  } catch (error) {
    if (error instanceof PayoutNotPendingError) return { ok: false, error: error.message };
    console.error("[payouts] could not record payout", parsed.data.bookingId, error);
    return { ok: false, error: "Could not record the payout — please try again." };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/coordinator", "layout");
  revalidatePath("/provider", "layout");
  revalidatePath("/farmer", "layout");
  return { ok: true };
}

export async function setProviderCommissionAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession(["ADMIN"]);
  const parsed = setCommissionRateSchema.safeParse({
    providerId: formData.get("providerId"),
    commissionRate: formData.get("commissionRate"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a valid rate" };
  }

  await prisma.providerProfile.update({
    where: { id: parsed.data.providerId },
    data: { commissionRate: parsed.data.commissionRate },
  });
  revalidatePath("/admin/providers");
  revalidatePath("/coordinator/payouts");
  return { ok: true };
}

export async function createHospitalAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession(["ADMIN"]);
  const parsed = hospitalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  await prisma.hospital.create({ data: parsed.data });
  revalidatePath("/admin/hospitals");
  revalidatePath("/hospitals");
  return { ok: true };
}

export async function updateHospitalAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const parsed = hospitalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!id || !parsed.success) {
    return { ok: false, error: parsed.success ? "Missing hospital id" : parsed.error.issues[0]?.message };
  }

  await prisma.hospital.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/hospitals");
  revalidatePath("/hospitals");
  return { ok: true };
}

/** Fire-and-forget — plain `<form action>` with a confirm() on the client. */
export async function deleteHospitalAction(formData: FormData): Promise<void> {
  await requireSession(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  await prisma.hospital.delete({ where: { id } });
  revalidatePath("/admin/hospitals");
  revalidatePath("/hospitals");
}
