import { z } from "zod";
import {
  AgriCategory,
  AyushmanStatus,
  HealthCategory,
  Role,
  Section,
} from "@/generated/prisma/enums";
import { PUBLIC_REGISTRATION_ROLES } from "@/lib/constants";

const roleValues = Object.values(Role) as [Role, ...Role[]];
// Enforced here too, not just hidden from the <select> — a raw POST to
// registerUser must not be able to self-register as Admin either.
const publicRoleValues = PUBLIC_REGISTRATION_ROLES as [Role, ...Role[]];
const sectionValues = Object.values(Section) as [Section, ...Section[]];
const agriValues = Object.values(AgriCategory) as [AgriCategory, ...AgriCategory[]];
const healthValues = Object.values(HealthCategory) as [HealthCategory, ...HealthCategory[]];
const ayushmanValues = Object.values(AyushmanStatus) as [AyushmanStatus, ...AyushmanStatus[]];

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    identifier: z.string().trim().min(3, "Enter a phone number or email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(publicRoleValues),
  })
  .transform((data) => {
    const isEmail = data.identifier.includes("@");
    return {
      ...data,
      email: isEmail ? data.identifier.toLowerCase() : undefined,
      phone: isEmail ? undefined : data.identifier,
    };
  });

/** Admin-created Coordinator account — the only way to get that role besides promotion. */
export const createCoordinatorSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the coordinator's full name"),
    identifier: z.string().trim().min(3, "Enter a phone number or email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .transform((data) => {
    const isEmail = data.identifier.includes("@");
    return {
      ...data,
      email: isEmail ? data.identifier.toLowerCase() : undefined,
      phone: isEmail ? undefined : data.identifier,
    };
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export const requestPasswordResetSchema = z.object({
  identifier: z.string().trim().min(3),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createBookingSchema = z
  .object({
    providerId: z.string().min(1),
    preferredDate: z.string().optional(),
    description: z.string().trim().min(5, "Tell the provider what you need"),
    ayushmanCard: z.enum(ayushmanValues).optional(),
  })
  .strict();

export const manageBookingSchema = z.object({
  bookingId: z.string().min(1),
  status: z.string().optional(),
  providerId: z.string().optional(),
  notes: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().trim().min(3, "Give a short cancellation reason"),
});

export const rateProviderSchema = z.object({
  bookingId: z.string().min(1),
  stars: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export const updateProviderProfileSchema = z.object({
  displayName: z.string().trim().min(2),
  section: z.enum(sectionValues),
  agriCategory: z.enum(agriValues).optional(),
  healthCategory: z.enum(healthValues).optional(),
  location: z.string().trim().min(2),
  district: z.string().trim().optional(),
  phone: z.string().trim().min(6),
  availability: z.string().trim().optional(),
  ayushmanStatus: z.enum(ayushmanValues).optional(),
  bio: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankIfsc: z.string().trim().optional(),
  upiId: z.string().trim().optional(),
  panNumber: z.string().trim().optional(),
  // Shown on the provider's directory card; empty clears it.
  photoUrl: z.union([
    z.literal(""),
    z.url({ protocol: /^https?$/, error: "Photo link must start with http:// or https://" }),
  ]),
});

export const aiExtractSchema = z.object({
  message: z.string().trim().min(5, "Paste the WhatsApp message first"),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(roleValues),
});

export const resolveRefundSchema = z.object({
  bookingId: z.string().min(1),
  refundPercent: z.coerce
    .number()
    .int("Use a whole-number percentage")
    .min(0, "Refund can't be below 0%")
    .max(100, "Refund can't be above 100%"),
  notes: z.string().trim().max(1000),
});

export const markPayoutPaidSchema = z.object({
  bookingId: z.string().min(1),
  method: z.enum(["UPI", "BANK_TRANSFER", "OTHER"]),
  reference: z.string().trim().min(4, "Enter the UTR / transaction reference").max(100),
});

export const setCommissionRateSchema = z.object({
  providerId: z.string().min(1),
  commissionRate: z.coerce.number().min(0).max(100),
});
