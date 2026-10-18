"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { notify } from "@/lib/notifications";
import { rateProviderSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export async function rateProvider(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER"]);
  const parsed = rateProviderSchema.safeParse({
    bookingId: formData.get("bookingId"),
    stars: formData.get("stars"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Pick a star rating" };
  }

  const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking || booking.farmerId !== user.id || !booking.providerId) {
    return { ok: false, error: "Booking not found" };
  }

  const existing = await prisma.rating.findUnique({ where: { bookingId: booking.id } });
  if (existing) return { ok: false, error: "You've already rated this booking" };

  await prisma.rating.create({
    data: {
      bookingId: booking.id,
      providerId: booking.providerId,
      farmerId: user.id,
      stars: parsed.data.stars,
      comment: parsed.data.comment,
    },
  });

  const agg = await prisma.rating.aggregate({
    where: { providerId: booking.providerId },
    _avg: { stars: true },
    _count: true,
  });
  await prisma.providerProfile.update({
    where: { id: booking.providerId },
    data: {
      ratingAvg: agg._avg.stars ?? parsed.data.stars,
      ratingCount: agg._count,
    },
  });

  const provider = await prisma.providerProfile.findUnique({ where: { id: booking.providerId } });
  if (provider) {
    await notify({
      userId: provider.userId,
      type: "RATING_RECEIVED",
      title: "New rating received",
      message: `You received a ${parsed.data.stars}-star rating.`,
      bookingId: booking.id,
    });
  }

  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  return { ok: true };
}
