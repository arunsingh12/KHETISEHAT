"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { DASHBOARD_BY_ROLE } from "@/lib/constants";

/** Called when a user opens their Notifications page — clears the unread badge. */
export async function markNotificationsRead(): Promise<void> {
  const user = await requireSession();
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  revalidatePath(DASHBOARD_BY_ROLE[user.role], "layout");
}
