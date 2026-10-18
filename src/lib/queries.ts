import { prisma } from "@/lib/prisma";
import type {
  AgriCategory,
  AyushmanStatus,
  HealthCategory,
  HospitalType,
  Role,
} from "@/generated/prisma/enums";

export function listAgriProviders(filters: { category?: AgriCategory; location?: string }) {
  return prisma.providerProfile.findMany({
    where: {
      section: "AGRI",
      verified: true,
      ...(filters.category ? { agriCategory: filters.category } : {}),
      ...(filters.location
        ? { location: { contains: filters.location } }
        : {}),
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
      ...(filters.category ? { healthCategory: filters.category } : {}),
      ...(filters.location ? { location: { contains: filters.location } } : {}),
      ...(filters.ayushman ? { ayushmanStatus: filters.ayushman } : {}),
    },
    orderBy: { ratingAvg: "desc" },
  });
}

export function listHospitals(filters: {
  district?: string;
  type?: HospitalType;
  ayushman?: AyushmanStatus;
}) {
  return prisma.hospital.findMany({
    where: {
      ...(filters.district ? { district: filters.district } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.ayushman ? { ayushmanStatus: filters.ayushman } : {}),
    },
    orderBy: { name: "asc" },
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
    where: { status: { in: ["CANCELLED", "DISPUTED"] } },
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

export function getHospital(id: string) {
  return prisma.hospital.findUnique({ where: { id } });
}
