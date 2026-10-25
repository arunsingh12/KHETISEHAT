/**
 * Placeholder provider photos for the demo directory — free Unsplash photos
 * (Unsplash License), hotlinked from images.unsplash.com and matched to each
 * provider's service. Only fills providers that have no photo yet, so a
 * photo a provider sets in Account Settings is never overwritten.
 *
 * Run on its own with: npm run db:demo-photos   (also runs at the end of db:seed)
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const PHOTOS: Record<string, string[]> = {
  DRONE_SERVICES: [
    "photo-1560493676-04071c5f467b",
    "photo-1656407410275-e63e689bcd90",
    "photo-1627920769541-daa658ed6b59",
    "photo-1713952160156-bb59cac789a9",
    "photo-1627920769842-6887c6df05ca",
  ],
  EQUIPMENT_RENTAL: [
    "photo-1696441567908-6a04d49e1350",
    "photo-1571509107684-7e3034a90012",
    "photo-1685335686020-e0b487f7f426",
    "photo-1718470684824-3c53a74523bc",
    "photo-1683552515328-5a8d58755e9c",
  ],
  AGRONOMIST: [
    "photo-1620901433789-1d2f85a93653",
    "photo-1492496913980-501348b61469",
    "photo-1530507629858-e4977d30e9e0",
    "photo-1623211269755-569fec0536d2",
  ],
  SOIL_TESTING: [
    "photo-1562722902-d33533894eea",
    "photo-1618212624319-3cd9681707e2",
    "photo-1557234195-bd9f290f0e4d",
    "photo-1763844599737-be3850c60cea",
  ],
  SOLAR_SERVICES: [
    "photo-1509391366360-2e959784a276",
    "photo-1558449028-b53a39d100fc",
    "photo-1724041875334-0a6397111c7e",
    "photo-1508514177221-188b1cf16e9d",
  ],
  DOCTOR: [
    "photo-1612349317150-e413f6a5b16d",
    "photo-1622253692010-333f2da6031d",
    "photo-1551601651-2a8555f1a136",
    "photo-1712215544003-af10130f8eb3",
  ],
  NURSE: [
    "photo-1559839734-2b71ea197ec2",
    "photo-1584432810601-6c7f27d2362b",
    "photo-1576091160550-2173dba999ef",
    "photo-1638202993928-7267aad84c31",
  ],
  PHARMACY: [
    "photo-1631549916768-4119b2e5f926",
    "photo-1607619056574-7b8d3ee536b2",
    "photo-1576602976047-174e57a47881",
    "photo-1642055514517-7b52288890ec",
  ],
  PATHOLOGY_LAB: [
    "photo-1532187863486-abf9dbad1b69",
    "photo-1582719471384-894fbb16e074",
    "photo-1606206591513-adbfbdd7a177",
    "photo-1518152006812-edab29b069ac",
  ],
  PHYSIOTHERAPIST: [
    "photo-1645005512968-0c1fe99f0093",
    "photo-1649751361457-01d3a696c7e6",
    "photo-1519823551278-64ac92734fb1",
    "photo-1706353399656-210cca727a33",
  ],
  AMBULANCE: [
    "photo-1554734867-bf3c00a49371",
    "photo-1619025873875-59dfdd2bbbd6",
    "photo-1612574935301-af13ccce9258",
    "photo-1579037005241-a79202c7e9fd",
  ],
};

const FALLBACK = ["photo-1500382017468-9049fed747ef"]; // farm fields

function photoUrl(id: string) {
  return `https://images.unsplash.com/${id}?w=800&h=500&fit=crop&crop=faces,center&auto=format&q=70`;
}

export async function assignDemoPhotos(prisma: PrismaClient) {
  const providers = await prisma.providerProfile.findMany({
    // On MongoDB a never-set field is missing, which `null` alone does not match.
    where: { OR: [{ photoUrl: { isSet: false } }, { photoUrl: null }, { photoUrl: "" }] },
    orderBy: { createdAt: "asc" },
  });

  const used: Record<string, number> = {};
  for (const p of providers) {
    const category = p.agriCategory ?? p.healthCategory ?? "";
    const pool = PHOTOS[category] ?? FALLBACK;
    const i = used[category] ?? 0;
    used[category] = i + 1;
    await prisma.providerProfile.update({
      where: { id: p.id },
      data: { photoUrl: photoUrl(pool[i % pool.length]) },
    });
  }
  return providers.length;
}

// Run directly (npm run db:demo-photos), not when imported by the seed.
if (process.argv[1]?.endsWith("demo-photos.ts")) {
  const prisma = new PrismaClient();
  assignDemoPhotos(prisma)
    .then((p) => console.log(`Added demo photos to ${p} provider(s).`))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
