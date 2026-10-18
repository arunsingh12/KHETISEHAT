"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { extractBookingFromMessage, type ExtractedBooking } from "@/lib/ai/extractBooking";
import { aiExtractSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export type ExtractActionResult =
  | { ok: true; data: ExtractedBooking }
  | { ok: false; error: string };

export async function extractBookingAction(
  _prevState: ExtractActionResult | null,
  formData: FormData,
): Promise<ExtractActionResult> {
  await requireSession(["COORDINATOR", "ADMIN"]);

  const parsed = aiExtractSchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Paste a message first" };
  }

  const data = await extractBookingFromMessage(parsed.data.message);
  return { ok: true, data };
}

/**
 * Saves the coordinator-reviewed draft as a real booking. If the farmer
 * phone number isn't already registered, a minimal Farmer account is
 * created for them — they can set a password later via "Forgot password".
 */
export async function saveAiBookingDraft(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession(["COORDINATOR", "ADMIN"]);

  const section = String(formData.get("section") ?? "AGRI") as "AGRI" | "HEALTH";
  const agriCategory = (formData.get("agriCategory") as string) || null;
  const healthCategory = (formData.get("healthCategory") as string) || null;
  const farmerName = String(formData.get("name") ?? "").trim() || "Unnamed Farmer";
  const phone = String(formData.get("phone") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const preferredDateText = String(formData.get("preferredDateText") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const urgency = String(formData.get("urgency") ?? "").trim();
  const specialInstructions = String(formData.get("specialInstructions") ?? "").trim();
  const sourceMessage = String(formData.get("sourceMessage") ?? "");
  const aiConfidence = String(formData.get("aiConfidence") ?? "{}");

  if (!phone) {
    return { ok: false, error: "A phone number is needed to create or match the farmer" };
  }

  let farmer = await prisma.user.findFirst({ where: { phone } });
  if (!farmer) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
    farmer = await prisma.user.create({
      data: { name: farmerName, phone, passwordHash, role: "FARMER" },
    });
  }

  const descriptionParts = [
    location && `Location: ${location}`,
    preferredDateText && `Preferred: ${preferredDateText}`,
    urgency && `Urgency: ${urgency}`,
    details,
    specialInstructions && `Instructions: ${specialInstructions}`,
  ].filter(Boolean);

  await prisma.booking.create({
    data: {
      farmerId: farmer.id,
      section,
      agriCategory: section === "AGRI" ? (agriCategory as never) : null,
      healthCategory: section === "HEALTH" ? (healthCategory as never) : null,
      description: descriptionParts.join(" • ") || "AI-drafted booking",
      status: "PENDING",
      aiExtracted: true,
      aiConfidence,
      sourceMessage,
    },
  });

  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}
