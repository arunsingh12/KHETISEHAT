import { prisma } from "@/lib/prisma";
import { parsePlaceList, storedCodesFor } from "@/lib/agri-catalog";
import { AgriCategory as AgriCategoryEnum, HealthCategory as HealthCategoryEnum } from "@/generated/prisma/enums";

const AGRI_VALUES = new Set<string>(Object.values(AgriCategoryEnum));
const HEALTH_VALUES = new Set<string>(Object.values(HealthCategoryEnum));
import type {
  AgriCategory,
  AyushmanStatus,
  HealthCategory,
  Role,
} from "@/generated/prisma/enums";

/**
 * Free-text location search: matches the provider's base location, state,
 * and — exactly, after the same tidying the profile form applies — any
 * district, village or pincode in their service area.
 */
function locationFilter(location: string | undefined) {
  const term = location?.trim();
  if (!term) return {};
  const tidy = parsePlaceList(term)[0] ?? term;
  return {
    OR: [
      { location: { contains: term, mode: "insensitive" as const } },
      { district: { contains: term, mode: "insensitive" as const } },
      { serviceState: { contains: term, mode: "insensitive" as const } },
      { serviceDistricts: { has: tidy } },
      { serviceVillages: { has: tidy } },
    ],
  };
}

export function listAgriProviders(filters: { category?: AgriCategory; service?: string; location?: string }) {
  return prisma.providerProfile.findMany({
    where: {
      section: "AGRI",
      verified: true,
      // Ignore unknown values from the URL instead of failing the query.
      ...(filters.category && AGRI_VALUES.has(filters.category)
        ? { agriCategory: { in: storedCodesFor(filters.category) } }
        : {}),
      ...(filters.service ? { agriServices: { has: filters.service } } : {}),
      ...locationFilter(filters.location),
    },
    orderBy: { ratingAvg: "desc" },
  });
}

export function listHealthProviders(filters: {
  category?: HealthCategory;
  location?: string;
  ayushman?: AyushmanStatus;
}) {
  return prisma.providerProfile.findMany({
    where: {
      section: "HEALTH",
      verified: true,
      ...(filters.category && HEALTH_VALUES.has(filters.category) ? { healthCategory: filters.category } : {}),
      ...locationFilter(filters.location),
      ...(filters.ayushman ? { ayushmanStatus: filters.ayushman } : {}),
    },
    orderBy: { ratingAvg: "desc" },
  });
}

export function getFarmerBookings(
  farmerId: string,
  filters: { status?: string; section?: string } = {},
) {
  return prisma.booking.findMany({
    where: {
      farmerId,
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.section ? { section: filters.section as never } : {}),
    },
    include: { provider: true, rating: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getProviderBookings(providerId: string) {
  return prisma.booking.findMany({
    where: { providerId },
    include: { farmer: true, provider: true, rating: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getCoordinatorBookings(filters: { status?: string; section?: string }) {
  return prisma.booking.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.section ? { section: filters.section as never } : {}),
    },
    include: { farmer: true, provider: true, rating: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getCancelledAndDisputedBookings() {
  return prisma.booking.findMany({
    // Plus refund requests already decided with a partial (or no) refund —
    // those move on to payout instead of being cancelled.
    where: { OR: [{ status: { in: ["CANCELLED", "DISPUTED"] } }, { refundPercent: { gte: 0 } }] },
    include: { farmer: true, provider: true, rating: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getAllProviders() {
  return prisma.providerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getLowRatedProviders() {
  return prisma.providerProfile.findMany({
    where: { ratingCount: { gt: 0 }, ratingAvg: { lt: 3 } },
    orderBy: { ratingAvg: "asc" },
  });
}

export function getUnverifiedProviders() {
  return prisma.providerProfile.findMany({
    where: { verified: false },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getSettledBookingsForPayout() {
  return prisma.booking.findMany({
    where: { escrowStatus: { in: ["HELD", "RELEASED"] }, serviceAmount: { not: null } },
    include: { provider: true, farmer: true },
    orderBy: { paidAt: "desc" },
    take: 100,
  });
}

export function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export function getProviderProfileForUser(userId: string) {
  return prisma.providerProfile.findUnique({ where: { userId } });
}

export function getPendingRequestsCount() {
  return prisma.booking.count({ where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] } } });
}

/** A single provider's own payout history — same shape as the coordinator ledger, scoped down. */
export function getProviderPayouts(providerId: string) {
  return prisma.booking.findMany({
    where: { providerId, escrowStatus: { in: ["HELD", "RELEASED"] }, serviceAmount: { not: null } },
    include: { provider: true, farmer: true },
    orderBy: { paidAt: "desc" },
  });
}

// ---------- admin ----------

/** Work the farmer has confirmed — waiting for the admin to pay the provider. */
export function getPayoutsAwaitingApproval() {
  return prisma.booking.findMany({
    where: { status: "CONFIRMED", escrowStatus: "HELD" },
    include: { provider: true, farmer: true },
    orderBy: { confirmedAt: "asc" },
  });
}

export function getRecentPayouts() {
  return prisma.booking.findMany({
    where: { escrowStatus: "RELEASED" },
    include: { provider: true, farmer: true },
    orderBy: { releasedAt: "desc" },
    take: 50,
  });
}

// ---------- farmers & providers (admin + coordinator) ----------

export type PeopleRole = "FARMER" | "PROVIDER";

/** Farmers and providers for the staff people list, with booking counts. */
export function listPeople(filters: { role?: PeopleRole; q?: string; status?: "active" | "disabled" | "unverified" }) {
  const q = filters.q?.trim();
  return prisma.user.findMany({
    where: {
      role: filters.role ? filters.role : { in: ["FARMER", "PROVIDER"] },
      ...(filters.status === "active" ? { active: true } : {}),
      ...(filters.status === "disabled" ? { active: false } : {}),
      ...(filters.status === "unverified" ? { providerProfile: { is: { verified: false } } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      providerProfile: { include: { _count: { select: { bookings: true } } } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
}

/** One farmer or provider with everything staff need: profile and bookings (either side). */
export async function getPerson(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { providerProfile: true } });
  if (!user || (user.role !== "FARMER" && user.role !== "PROVIDER")) return null;
  const bookings = await prisma.booking.findMany({
    where: user.providerProfile ? { providerId: user.providerProfile.id } : { farmerId: user.id },
    include: { farmer: true, provider: true, rating: true },
    orderBy: { createdAt: "desc" },
  });
  return { user, bookings };
}

/** Verified providers to pick from when staff book on a farmer's behalf. */
export function getBookableProviders() {
  return prisma.providerProfile.findMany({
    where: { verified: true, user: { active: true } },
    orderBy: [{ section: "asc" }, { displayName: "asc" }],
  });
}

export function getAllUsers(filters: { role?: Role; q?: string } = {}) {
  return prisma.user.findMany({
    where: {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q } },
              { email: { contains: filters.q } },
              { phone: { contains: filters.q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPlatformStats() {
  const [
    farmers,
    providers,
    coordinators,
    admins,
    bookingsByStatus,
    releasedAgg,
    disputedCount,
    unverifiedCount,
    awaitingApprovalCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "FARMER" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "COORDINATOR" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.booking.aggregate({
      where: { escrowStatus: "RELEASED" },
      _sum: { platformFee: true, serviceAmount: true },
    }),
    prisma.booking.count({ where: { status: "DISPUTED" } }),
    prisma.providerProfile.count({ where: { verified: false } }),
    prisma.booking.count({ where: { status: "CONFIRMED", escrowStatus: "HELD" } }),
  ]);

  return {
    userCounts: { farmers, providers, coordinators, admins },
    bookingsByStatus,
    totalCommissionEarned: releasedAgg._sum.platformFee ?? 0,
    totalGrossSettled: releasedAgg._sum.serviceAmount ?? 0,
    disputedCount,
    unverifiedCount,
    awaitingApprovalCount,
  };
}
