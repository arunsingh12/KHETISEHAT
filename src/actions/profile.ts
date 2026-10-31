"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { updateProviderProfileSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export async function updateProviderProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireSession(["PROVIDER"]);

  const parsed = updateProviderProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    section: formData.get("section"),
    agriCategory: formData.get("agriCategory") || undefined,
    healthCategory: formData.get("healthCategory") || undefined,
    agriServices: formData.getAll("agriServices").map(String),
    otherService: formData.get("otherService") ?? undefined,
    location: formData.get("location"),
    serviceState: formData.get("serviceState") || undefined,
    serviceDistricts: String(formData.get("serviceDistricts") ?? ""),
    serviceVillages: String(formData.get("serviceVillages") ?? ""),
    deliveryMethods: formData.getAll("deliveryMethods").map(String),
    qualifications: formData.get("qualifications") ?? undefined,
    licences: formData.get("licences") ?? undefined,
    pricingNote: formData.get("pricingNote") ?? undefined,
    phone: formData.get("phone"),
    availability: formData.get("availability") || undefined,
    ayushmanStatus: formData.get("ayushmanStatus") || undefined,
    bio: formData.get("bio") || undefined,
    bankAccountNumber: formData.get("bankAccountNumber") || undefined,
    bankIfsc: formData.get("bankIfsc") || undefined,
    upiId: formData.get("upiId") || undefined,
    panNumber: formData.get("panNumber") || undefined,
    photoUrl: String(formData.get("photoUrl") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  const data = parsed.data;
  const payoutKycComplete = Boolean(
    (data.bankAccountNumber && data.bankIfsc) || data.upiId,
  ) && Boolean(data.panNumber);

  await prisma.providerProfile.update({
    where: { userId: user.id },
    data: {
      ...data,
      // Older screens read the single `district` field — keep it as the first service district.
      district: data.serviceDistricts[0] ?? null,
      photoUrl: data.photoUrl || null,
      payoutKycComplete,
    },
  });

  revalidatePath("/provider");
  revalidatePath("/");
  revalidatePath("/agri-services");
  revalidatePath("/health-services");
  return { ok: true };
}

/** Fire-and-forget toggle used as a plain `<form action={verifyProvider}>` — no inline feedback needed. */
export async function verifyProvider(formData: FormData): Promise<void> {
  await requireSession(["COORDINATOR", "ADMIN"]);
  const providerId = String(formData.get("providerId") ?? "");
  const verified = formData.get("verified") === "true";

  await prisma.providerProfile.update({ where: { id: providerId }, data: { verified } });

  revalidatePath("/coordinator");
  revalidatePath("/admin");
  revalidatePath("/agri-services");
  revalidatePath("/health-services");
}
