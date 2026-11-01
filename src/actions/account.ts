"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { userPhotoSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/** A farmer saving their own profile picture (providers save theirs with the provider profile). */
export async function saveMyPhotoAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER"]);
  const parsed = userPhotoSchema.safeParse({ photoUrl: String(formData.get("photoUrl") ?? "") });
  if (!parsed.success) return { ok: false, error: "That photo couldn't be saved — please upload it again" };

  await prisma.user.update({ where: { id: user.id }, data: { photoUrl: parsed.data.photoUrl || null } });
  revalidatePath("/", "layout");
  return { ok: true };
}
