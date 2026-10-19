/**
 * Demo data mirroring the original Bubble prototype's provider directory
 * and a spread of bookings across the payment lifecycle so
 * every dashboard has something to look at on first run.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { assignDemoPhotos } from "./demo-photos";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set — see .env.example");
const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

async function upsertUser(params: {
  name: string;
  phone: string;
  email?: string;
  role: "FARMER" | "PROVIDER" | "COORDINATOR" | "ADMIN";
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const existing = await prisma.user.findFirst({ where: { phone: params.phone } });
  return existing ?? prisma.user.create({ data: { ...params, passwordHash } });
}

type ProviderSeed = {
  name: string;
  phone: string;
  section: "AGRI" | "HEALTH";
  agriCategory?: "DRONE_SERVICES" | "EQUIPMENT_RENTAL" | "AGRONOMIST" | "SOIL_TESTING" | "SOLAR_SERVICES";
  healthCategory?: "DOCTOR" | "NURSE" | "PHARMACY" | "PATHOLOGY_LAB" | "PHYSIOTHERAPIST" | "AMBULANCE";
  bio: string;
  location: string;
  district: string;
  ayushmanStatus?: "EMPANELLED" | "NOT_EMPANELLED" | "UNKNOWN";
  availability?: string;
  ratingAvg: number;
  ratingCount: number;
};

const AGRI_PROVIDERS: ProviderSeed[] = [
  {
    name: "Priya Sharma",
    phone: "9871234567",
    section: "AGRI",
    agriCategory: "DRONE_SERVICES",
    bio: "Expert drone spraying for paddy and wheat fields across Gorakhpur district with modern equipment.",
    location: "Gorakhpur",
    district: "Gorakhpur",
    ratingAvg: 4.5,
    ratingCount: 28,
  },
  {
    name: "Anjali Kumari",
    phone: "9856781234",
    section: "AGRI",
    agriCategory: "EQUIPMENT_RENTAL",
    bio: "Wide range of farm equipment for rent including tractors, harvesters and seed drills.",
    location: "Gorakhpur",
    district: "Gorakhpur",
    ratingAvg: 4.2,
    ratingCount: 15,
  },
  {
    name: "Deepak Patel",
    phone: "9845671234",
    section: "AGRI",
    agriCategory: "AGRONOMIST",
    bio: "Certified agronomist with 10 years experience in crop advisory and field management.",
    location: "Deoria",
    district: "Deoria",
    ratingAvg: 4.7,
    ratingCount: 22,
  },
  {
    name: "Meena Verma",
    phone: "9834561234",
    section: "AGRI",
    agriCategory: "SOIL_TESTING",
    bio: "Comprehensive soil testing with nutrient analysis reports within 48 hours.",
    location: "Kushinagar",
    district: "Kushinagar",
    ratingAvg: 4.3,
    ratingCount: 18,
  },
  {
    name: "Arjun Tiwari",
    phone: "9823451234",
    section: "AGRI",
    agriCategory: "SOLAR_SERVICES",
    bio: "Solar pump installation and maintenance services for irrigation needs.",
    location: "Maharajganj",
    district: "Maharajganj",
    ratingAvg: 4.6,
    ratingCount: 11,
  },
  {
    name: "Priya Sharma",
    phone: "9854321234",
    section: "AGRI",
    agriCategory: "DRONE_SERVICES",
    bio: "Drone spraying service covering Gorakhpur and Maharajganj districts.",
    location: "Maharajganj",
    district: "Maharajganj",
    ratingAvg: 4.9,
    ratingCount: 10,
  },
  {
    name: "Deepak Patel",
    phone: "9832101234",
    section: "AGRI",
    agriCategory: "DRONE_SERVICES",
    bio: "Professional drone services for crop protection and field mapping.",
    location: "Kushinagar, Hata",
    district: "Kushinagar",
    ratingAvg: 2.3,
    ratingCount: 9,
  },
  {
    name: "Meena Verma",
    phone: "9821001234",
    section: "AGRI",
    agriCategory: "EQUIPMENT_RENTAL",
    bio: "Equipment rental including rotavators, power tillers and sprayers.",
    location: "Kushinagar",
    district: "Kushinagar",
    ratingAvg: 0,
    ratingCount: 0,
  },
  {
    name: "Deepak Patel",
    phone: "9866551234",
    section: "AGRI",
    agriCategory: "DRONE_SERVICES",
    bio: "Advanced drone fleet for precision agriculture across Gorakhpur region.",
    location: "Gorakhpur",
    district: "Gorakhpur",
    ratingAvg: 4.4,
    ratingCount: 30,
  },
];

const HEALTH_PROVIDERS: ProviderSeed[] = [
  {
    name: "Kavita Gupta",
    phone: "9812341234",
    section: "HEALTH",
    healthCategory: "DOCTOR",
    ayushmanStatus: "EMPANELLED",
    bio: "MBBS doctor with 15 years rural healthcare experience, Ayushman empanelled.",
    location: "Gorakhpur",
    district: "Gorakhpur",
    availability: "Mon-Sat 9am-6pm",
    ratingAvg: 4.8,
    ratingCount: 35,
  },
  {
    name: "Priya Sharma",
    phone: "9801231234",
    section: "HEALTH",
    healthCategory: "NURSE",
    ayushmanStatus: "NOT_EMPANELLED",
    bio: "Experienced home nursing care for post-operative and chronic illness patients.",
    location: "Gorakhpur",
    district: "Gorakhpur",
    availability: "Mon-Sun 8am-8pm",
    ratingAvg: 4.4,
    ratingCount: 19,
  },
  {
    name: "Anjali Kumari",
    phone: "9898761234",
    section: "HEALTH",
    healthCategory: "PHARMACY",
    ayushmanStatus: "UNKNOWN",
    bio: "Well-stocked pharmacy with generic medicines and health products.",
    location: "Deoria",
    district: "Deoria",
    availability: "Mon-Sat 9am-9pm",
    ratingAvg: 4.1,
    ratingCount: 14,
  },
  {
    name: "Deepak Patel",
    phone: "9887651234",
    section: "HEALTH",
    healthCategory: "PATHOLOGY_LAB",
    ayushmanStatus: "EMPANELLED",
    bio: "Pathology lab offering 100+ diagnostic tests with home sample collection.",
    location: "Gorakhpur",
    district: "Gorakhpur",
    availability: "Mon-Sat 7am-7pm",
    ratingAvg: 4.6,
    ratingCount: 27,
  },
  {
    name: "Meena Verma",
    phone: "9876541234",
    section: "HEALTH",
    healthCategory: "PHYSIOTHERAPIST",
    ayushmanStatus: "NOT_EMPANELLED",
    bio: "Physiotherapy at home for injury recovery and mobility improvement.",
    location: "Kushinagar",
    district: "Kushinagar",
    availability: "Mon-Fri 10am-5pm",
    ratingAvg: 4.2,
    ratingCount: 16,
  },
  {
    name: "Arjun Tiwari",
    phone: "9865431234",
    section: "HEALTH",
    healthCategory: "AMBULANCE",
    ayushmanStatus: "UNKNOWN",
    bio: "24/7 ambulance service with basic life support equipment.",
    location: "Maharajganj",
    district: "Maharajganj",
    availability: "24/7",
    ratingAvg: 4.3,
    ratingCount: 9,
  },
  {
    name: "Anjali Kumari",
    phone: "9843211234",
    section: "HEALTH",
    healthCategory: "DOCTOR",
    ayushmanStatus: "EMPANELLED",
    bio: "Qualified physician serving rural communities in Deoria district.",
    location: "Deoria",
    district: "Deoria",
    availability: "Mon-Sat 10am-4pm",
    ratingAvg: 4.3,
    ratingCount: 5,
  },
  {
    name: "Arjun Tiwari",
    phone: "9810991234",
    section: "HEALTH",
    healthCategory: "DOCTOR",
    ayushmanStatus: "EMPANELLED",
    bio: "Rural doctor with specialty in general medicine, Ayushman empanelled.",
    location: "Maharajganj",
    district: "Maharajganj",
    availability: "Mon-Sat 9am-5pm",
    ratingAvg: 0,
    ratingCount: 0,
  },
  {
    name: "Kavita Gupta",
    phone: "9899881234",
    section: "HEALTH",
    healthCategory: "PHARMACY",
    ayushmanStatus: "NOT_EMPANELLED",
    bio: "Pharmacy stocking all essential medicines and surgical items.",
    location: "Varanasi",
    district: "Varanasi",
    availability: "Mon-Sun 8am-10pm",
    ratingAvg: 1.6,
    ratingCount: 12,
  },
  {
    name: "Meena Verma",
    phone: "9855441234",
    section: "HEALTH",
    healthCategory: "DOCTOR",
    ayushmanStatus: "EMPANELLED",
    bio: "General physician offering home visits and clinic consultations.",
    location: "Kushinagar",
    district: "Kushinagar",
    availability: "Mon-Sat 9am-6pm",
    ratingAvg: 4.7,
    ratingCount: 25,
  },
];

async function main() {
  console.log("Seeding admin, coordinator, farmer and providers…");

  await upsertUser({
    name: "Anita Admin",
    phone: "9900000000",
    email: "admin@khetisehat.test",
    role: "ADMIN",
  });

  await upsertUser({
    name: "Sunita Coordinator",
    phone: "9900000001",
    email: "coordinator@khetisehat.test",
    role: "COORDINATOR",
  });

  const farmer = await upsertUser({
    name: "Ramesh Yadav",
    phone: "9900000002",
    email: "farmer@khetisehat.test",
    role: "FARMER",
  });

  const providerRows = [];
  for (const seed of [...AGRI_PROVIDERS, ...HEALTH_PROVIDERS]) {
    const user = await upsertUser({ name: seed.name, phone: seed.phone, role: "PROVIDER" });
    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: seed.name,
        section: seed.section,
        agriCategory: seed.agriCategory,
        healthCategory: seed.healthCategory,
        bio: seed.bio,
        location: seed.location,
        district: seed.district,
        phone: seed.phone,
        availability: seed.availability,
        ayushmanStatus: seed.ayushmanStatus,
        verified: true,
        ratingAvg: seed.ratingAvg,
        ratingCount: seed.ratingCount,
      },
    });
    providerRows.push(profile);
  }

  console.log("Seeding sample bookings across the payment lifecycle…");
  const droneProvider = providerRows.find((p) => p.phone === "9871234567")!;
  const agronomist = providerRows.find((p) => p.phone === "9845671234")!;
  const soilTester = providerRows.find((p) => p.phone === "9834561234")!;
  const doctor = providerRows.find((p) => p.phone === "9812341234")!;
  const solar = providerRows.find((p) => p.phone === "9823451234")!;

  const existingBookings = await prisma.booking.count({ where: { farmerId: farmer.id } });
  if (existingBookings === 0) {
    // 1. Just requested — no price yet.
    await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        providerId: droneProvider.id,
        section: "AGRI",
        agriCategory: "DRONE_SERVICES",
        description: "Need drone spraying for 3 acres of wheat before the weekend.",
        status: "PENDING",
      },
    });

    // 2. Priced, waiting on the farmer to pay.
    await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        providerId: agronomist.id,
        section: "AGRI",
        agriCategory: "AGRONOMIST",
        description: "Crop advisory visit — leaves turning yellow on the paddy field.",
        status: "AWAITING_PAYMENT",
        serviceAmount: 600,
        commissionRate: agronomist.commissionRate,
        platformFee: Math.round(600 * (agronomist.commissionRate / 100)),
        providerNet: 600 - Math.round(600 * (agronomist.commissionRate / 100)),
      },
    });

    // 3. Paid to Kheti Sehat, provider can start.
    await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        providerId: soilTester.id,
        section: "AGRI",
        agriCategory: "SOIL_TESTING",
        description: "Soil nutrient test for the new plot near the canal.",
        status: "READY_TO_START",
        escrowStatus: "HELD",
        serviceAmount: 350,
        commissionRate: soilTester.commissionRate,
        platformFee: Math.round(350 * (soilTester.commissionRate / 100)),
        providerNet: 350 - Math.round(350 * (soilTester.commissionRate / 100)),
        razorpayOrderId: "sim_order_seed_3",
        razorpayPaymentId: "sim_pay_seed_3",
        paidAt: new Date(),
      },
    });

    // 4. Provider marked complete — waiting on the farmer to confirm (or auto-confirm).
    await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        providerId: doctor.id,
        section: "HEALTH",
        healthCategory: "DOCTOR",
        description: "General checkup and prescription renewal.",
        ayushmanCard: "EMPANELLED",
        status: "PROVIDER_COMPLETED",
        escrowStatus: "HELD",
        serviceAmount: 250,
        commissionRate: doctor.commissionRate,
        platformFee: Math.round(250 * (doctor.commissionRate / 100)),
        providerNet: 250 - Math.round(250 * (doctor.commissionRate / 100)),
        razorpayOrderId: "sim_order_seed_4",
        razorpayPaymentId: "sim_pay_seed_4",
        paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        providerCompletedAt: new Date(Date.now() - 30 * 60 * 1000),
        autoReleaseDueAt: new Date(Date.now() + 71.5 * 60 * 60 * 1000),
      },
    });

    // 5. Fully settled — admin paid the provider by UPI — with a rating.
    const settled = await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        providerId: solar.id,
        section: "AGRI",
        agriCategory: "SOLAR_SERVICES",
        description: "Solar pump annual maintenance.",
        status: "SETTLED",
        escrowStatus: "RELEASED",
        serviceAmount: 900,
        commissionRate: solar.commissionRate,
        platformFee: Math.round(900 * (solar.commissionRate / 100)),
        providerNet: 900 - Math.round(900 * (solar.commissionRate / 100)),
        razorpayOrderId: "sim_order_seed_5",
        razorpayPaymentId: "sim_pay_seed_5",
        payoutMethod: "UPI",
        payoutReference: "SEED-UTR-412345678901",
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        providerCompletedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        releasedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.rating.create({
      data: { bookingId: settled.id, providerId: solar.id, farmerId: farmer.id, stars: 5, comment: "Quick and reliable." },
    });

    // 6. Cancelled before payment.
    await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        providerId: droneProvider.id,
        section: "AGRI",
        agriCategory: "DRONE_SERVICES",
        description: "Spraying request for the far field.",
        status: "CANCELLED",
        cancelledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        cancellationReason: "Rain forecast — rescheduling for next week.",
      },
    });
  }

  console.log("Adding demo provider photos…");
  await assignDemoPhotos(prisma);

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
