"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { saveProviderProfileFromForm } from "@/lib/provider-profile";
import type { ActionResult } from "@/lib/types";

export async function updateProviderProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireSession(["PROVIDER"]);
  return saveProviderProfileFromForm(user.id, formData);
}

/** Fire-and-forget toggle used as a plain `<form action={verifyProvider}>` — no inline feedback needed. */
export async function verifyProvider(formData: FormData): Promise<void> {
  await requireSession(["COORDINATOR", "ADMIN"]);
  const providerId = String(formData.get("providerId") ?? "");
  const verified = formData.get("verified") === "true";

  await prisma.providerProfile.update({ where: { id: providerId }, data: { verified } });

  revalidatePath("/coordinator", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/agri-services");
  revalidatePath("/health-services");
}
