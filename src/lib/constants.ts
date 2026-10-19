import {
  AgriCategory,
  AyushmanStatus,
  BookingStatus,
  EscrowStatus,
  HealthCategory,
  Role,
  Section,
} from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  FARMER: "Farmer",
  PROVIDER: "Service Provider",
  COORDINATOR: "Coordinator",
  ADMIN: "Administrator",
};

export const DASHBOARD_BY_ROLE: Record<Role, string> = {
  FARMER: "/farmer",
  PROVIDER: "/provider",
  COORDINATOR: "/coordinator",
  ADMIN: "/admin",
};

/**
 * Roles selectable at public sign-up. Admin and Coordinator are provisioned
 * directly (seeded, or promoted by an existing admin from /admin/users)
 * rather than self-registered — see the README, "Roles & dashboards".
 */
export const PUBLIC_REGISTRATION_ROLES: Role[] = ["FARMER", "PROVIDER"];

export const SECTION_LABELS: Record<Section, string> = {
  AGRI: "Agri Services",
  HEALTH: "Health Services",
};

export const AGRI_CATEGORY_LABELS: Record<AgriCategory, string> = {
  DRONE_SERVICES: "Drone Services",
  EQUIPMENT_RENTAL: "Equipment Rental",
  AGRONOMIST: "Agronomist",
  SOIL_TESTING: "Soil Testing",
  SOLAR_SERVICES: "Solar Services",
};

export const HEALTH_CATEGORY_LABELS: Record<HealthCategory, string> = {
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  PHARMACY: "Pharmacy",
  PATHOLOGY_LAB: "Pathology Lab",
  PHYSIOTHERAPIST: "Physiotherapist",
  AMBULANCE: "Ambulance",
};

export const AYUSHMAN_LABELS: Record<AyushmanStatus, string> = {
  EMPANELLED: "Ayushman Empanelled",
  NOT_EMPANELLED: "Not Empanelled",
  UNKNOWN: "Unknown",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting Payment",
  READY_TO_START: "Ready to Start",
  IN_PROGRESS: "In Progress",
  PROVIDER_COMPLETED: "Awaiting Your Confirmation",
  CONCERN_RAISED: "Concern Raised · Provider Fixing",
  CONFIRMED: "Confirmed · Payout Pending",
  SETTLED: "Settled",
  CANCELLED: "Cancelled",
  DISPUTED: "Refund Requested",
};

export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  UNPAID: "Unpaid",
  HELD: "Paid to Kheti Sehat",
  RELEASED: "Paid to Provider",
  REFUNDED: "Refunded",
  FROZEN: "On Hold (Refund Request)",
  PARTIAL: "Partially Paid",
};

/** How the admin paid a provider out of the Kheti Sehat account. */
export const PAYOUT_METHODS = {
  UPI: "UPI",
  BANK_TRANSFER: "Bank transfer (NEFT / IMPS / RTGS)",
  OTHER: "Other",
} as const;
export type PayoutMethod = keyof typeof PAYOUT_METHODS;

/** Hours a completed booking waits for the farmer before it is auto-confirmed (payout still needs admin approval). */
export const AUTO_CONFIRM_HOURS = 72;

/** Default platform commission when a provider profile doesn't set one. */
export const DEFAULT_COMMISSION_RATE = 10;

export function agriCategoryOptions() {
  return Object.entries(AGRI_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as AgriCategory,
    label,
  }));
}

export function healthCategoryOptions() {
  return Object.entries(HEALTH_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as HealthCategory,
    label,
  }));
}
