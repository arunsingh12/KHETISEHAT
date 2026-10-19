import clsx from "clsx";
import type { BookingStatus, EscrowStatus } from "@/generated/prisma/enums";
import { BOOKING_STATUS_LABELS, ESCROW_STATUS_LABELS } from "@/lib/constants";

const tones = {
  neutral: "text-status-neutral bg-status-neutral-bg",
  pending: "text-status-pending bg-status-pending-bg",
  active: "text-status-active bg-status-active-bg",
  danger: "text-status-danger bg-status-danger-bg",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

const BOOKING_STATUS_TONE: Record<BookingStatus, keyof typeof tones> = {
  PENDING: "neutral",
  AWAITING_PAYMENT: "pending",
  READY_TO_START: "active",
  IN_PROGRESS: "active",
  PROVIDER_COMPLETED: "pending",
  CONCERN_RAISED: "pending",
  CONFIRMED: "active",
  SETTLED: "active",
  CANCELLED: "danger",
  DISPUTED: "danger",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={BOOKING_STATUS_TONE[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>;
}

const ESCROW_STATUS_TONE: Record<EscrowStatus, keyof typeof tones> = {
  UNPAID: "neutral",
  HELD: "pending",
  RELEASED: "active",
  REFUNDED: "danger",
  FROZEN: "danger",
  PARTIAL: "pending",
};

export function EscrowStatusBadge({ status }: { status: EscrowStatus }) {
  return <Badge tone={ESCROW_STATUS_TONE[status]}>{ESCROW_STATUS_LABELS[status]}</Badge>;
}
