"use server";

/**
 * Admin and coordinator tools for managing farmers and providers: create
 * accounts, edit login details, reset passwords, enable/disable, delete,
 * edit a provider's profile, and book on a farmer's behalf.
 *
 * Every action checks the caller is ADMIN or COORDINATOR and that the target
 * is a FARMER or PROVIDER — staff accounts are managed only from Admin → Users.
 */
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { notify } from "@/lib/notifications";
import { saveProviderProfileFromForm } from "@/lib/provider-profile";
import {
  createPersonSchema,
  setPasswordSchema,
  staffBookingSchema,
  updateAccountSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

const STAFF = ["ADMIN", "COORDINATOR"] as const;
/** Where the people pages live for each staff role. */
const PEOPLE_BASE = { ADMIN: "/admin/people", COORDINATOR: "/coordinator/people" } as const;

async function requireStaff() {
  const user = await requireSession([...STAFF]);
  return { ...user, base: PEOPLE_BASE[user.role as keyof typeof PEOPLE_BASE] };
}

/** The farmer/provider being managed — never a staff account. */
async function managedUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { providerProfile: true } });
  if (!user || (user.role !== "FARMER" && user.role !== "PROVIDER")) return null;
  return user;
}

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/coordinator", "layout");
  revalidatePath("/");
  revalidatePath("/agri-services");
  revalidatePath("/health-services");
}

async function loginTaken(phone: string | null | undefined, email: string | null | undefined, exceptId?: string) {
  const or = [phone ? { phone } : null, email ? { email } : null].filter(Boolean) as { phone?: string; email?: string }[];
  if (or.length === 0) return false;
  const hit = await prisma.user.findFirst({ where: { OR: or, ...(exceptId ? { id: { not: exceptId } } : {}) } });
  return Boolean(hit);
}

export async function createPersonAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = createPersonSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  const { role, name, phone, email, password } = parsed.data;

  if (await loginTaken(phone, email)) return { ok: false, error: "An account with that phone/email already exists" };

  const user = await prisma.user.create({
    data: { name, phone, email, role, passwordHash: await bcrypt.hash(password, 10) },
  });
  if (role === "PROVIDER") {
    // Starts unverified like a self sign-up; staff fill the profile on the next screen.
    await prisma.providerProfile.create({
      data: { userId: user.id, displayName: name, section: "AGRI", location: "", phone: phone ?? "", verified: false },
    });
  }

  refresh();
  redirect(`${staff.base}/${user.id}?created=1`);
}

export async function updateAccountAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = updateAccountSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    email: String(formData.get("email") ?? "").trim(),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  const { userId, name, phone, email } = parsed.data;

  const user = await managedUser(userId);
  if (!user) return { ok: false, error: "Account not found" };
  if (await loginTaken(phone, email, userId)) {
    return { ok: false, error: "That phone or email is already used by another account" };
  }

  await prisma.user.update({ where: { id: userId }, data: { name, phone, email } });
  refresh();
  return { ok: true };
}

/** Staff set a new password, e.g. when a farmer forgets theirs and can't receive SMS. */
export async function setPasswordAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = setPasswordSchema.safeParse({ userId: formData.get("userId"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the password" };

  const user = await managedUser(parsed.data.userId);
  if (!user) return { ok: false, error: "Account not found" };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
  });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  return { ok: true };
}

export async function setActiveAction(formData: FormData): Promise<void> {
  await requireStaff();
  const user = await managedUser(String(formData.get("userId") ?? ""));
  if (!user) throw new Error("Account not found");
  await prisma.user.update({ where: { id: user.id }, data: { active: formData.get("active") === "true" } });
  refresh();
}

/**
 * Permanently deletes a farmer/provider — only when they have no bookings or
 * ratings, so payment and booking history is never lost. Otherwise disable.
 */
export async function deletePersonAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const user = await managedUser(String(formData.get("userId") ?? ""));
  if (!user) return { ok: false, error: "Account not found" };

  const [farmerBookings, providerBookings, ratings] = await Promise.all([
    prisma.booking.count({ where: { farmerId: user.id } }),
    user.providerProfile ? prisma.booking.count({ where: { providerId: user.providerProfile.id } }) : 0,
    prisma.rating.count({
      where: { OR: [{ farmerId: user.id }, ...(user.providerProfile ? [{ providerId: user.providerProfile.id }] : [])] },
    }),
  ]);
  if (farmerBookings + providerBookings + ratings > 0) {
    return { ok: false, error: "This account has bookings or ratings, so it can't be deleted — disable it instead." };
  }

  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  if (user.providerProfile) await prisma.providerProfile.delete({ where: { id: user.providerProfile.id } });
  await prisma.user.delete({ where: { id: user.id } });

  refresh();
  redirect(staff.base);
}

/** Staff edit a provider's whole profile — same form and rules as the provider's own. */
export async function staffUpdateProviderProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const user = await managedUser(String(formData.get("userId") ?? ""));
  if (!user?.providerProfile) return { ok: false, error: "Provider not found" };
  return saveProviderProfileFromForm(user.id, formData);
}

/** Staff book a service for a farmer (e.g. one who phoned in). */
export async function createBookingForFarmerAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = staffBookingSchema.safeParse({
    farmerId: formData.get("farmerId"),
    providerId: formData.get("providerId"),
    description: formData.get("description"),
    preferredDate: formData.get("preferredDate") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };

  const farmer = await managedUser(parsed.data.farmerId);
  if (!farmer || farmer.role !== "FARMER") return { ok: false, error: "Farmer not found" };
  const provider = await prisma.providerProfile.findUnique({
    where: { id: parsed.data.providerId },
    include: { user: true },
  });
  if (!provider || !provider.verified) return { ok: false, error: "Choose a verified provider" };

  const booking = await prisma.booking.create({
    data: {
      farmerId: farmer.id,
      providerId: provider.id,
      section: provider.section,
      agriCategory: provider.agriCategory,
      healthCategory: provider.healthCategory,
      description: parsed.data.description,
      preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : undefined,
      coordinatorNotes: `Booked by ${staff.name ?? "Kheti Sehat staff"} on the farmer's behalf.`,
      status: "PENDING",
    },
  });

  await Promise.all([
    notify({
      userId: provider.user.id,
      type: "BOOKING_CREATED",
      title: "New service request",
      sms: true,
      message: "A new request came in — set a price to move it to payment.",
      bookingId: booking.id,
    }),
    notify({
      userId: farmer.id,
      type: "BOOKING_CREATED",
      title: "Booking made for you",
      message: `Kheti Sehat requested ${provider.displayName} for you. You'll be asked to pay once they set a price.`,
      bookingId: booking.id,
    }),
  ]);

  refresh();
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider", "layout");
  return { ok: true };
}
