import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { updateProviderProfileSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/**
 * Validates the provider profile form and saves it for `userId`. Shared by
 * the provider's own Account Settings and by staff editing a provider from
 * Farmers & Providers, so both follow exactly the same rules.
 */
export async function saveProviderProfileFromForm(userId: string, formData: FormData): Promise<ActionResult> {
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
  const payoutKycComplete = Boolean((data.bankAccountNumber && data.bankIfsc) || data.upiId) && Boolean(data.panNumber);

  await prisma.providerProfile.update({
    where: { userId },
    data: {
      ...data,
      // Older screens read the single `district` field — keep it as the first service district.
      district: data.serviceDistricts[0] ?? null,
      photoUrl: data.photoUrl || null,
      payoutKycComplete,
    },
  });

  revalidatePath("/provider");
  revalidatePath("/admin", "layout");
  revalidatePath("/coordinator", "layout");
  revalidatePath("/");
  revalidatePath("/agri-services");
  revalidatePath("/health-services");
  return { ok: true };
}
