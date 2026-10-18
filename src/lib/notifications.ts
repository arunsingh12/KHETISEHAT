import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import type { NotificationType } from "@/generated/prisma/enums";

export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  /** Also text it to the user's phone — for steps someone in the field must act on. */
  sms?: boolean;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      bookingId: params.bookingId,
    },
  });

  if (params.sms) {
    const user = await prisma.user.findUnique({ where: { id: params.userId }, select: { phone: true } });
    await sendSms(user?.phone, `Kheti Sehat: ${params.title}. ${params.message}`);
  }
}
