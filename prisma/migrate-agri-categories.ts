/**
 * One-time move from the old agri category codes to the new taxonomy in
 * src/lib/agri-catalog.ts. For each provider on an old code it sets the new
 * category and adds the matching service (e.g. DRONE_SERVICES →
 * FARM_MACHINERY + "Drone Services"); bookings get the new category. It also
 * copies a provider's old single `district` into `serviceDistricts` when
 * that list is empty. Nothing else is invented — state and delivery methods
 * are left for the provider to fill in.
 *
 * Safe to run more than once. Dry run by default:
 *   npm run db:migrate-categories            # show what would change
 *   npm run db:migrate-categories -- --apply # write the changes
 *
 * Run --apply only once the new code is deployed: the previous version of
 * the site can't read the new category codes.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import type { AgriCategory } from "../src/generated/prisma/enums";
import { LEGACY_AGRI_CATEGORY_MAP } from "../src/lib/agri-catalog";

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();
const legacyCodes = Object.keys(LEGACY_AGRI_CATEGORY_MAP) as (keyof typeof LEGACY_AGRI_CATEGORY_MAP)[];

async function main() {
  console.log(apply ? "Applying changes…\n" : "Dry run — nothing will be written. Add --apply to save.\n");

  const providers = await prisma.providerProfile.findMany({
    where: { agriCategory: { in: legacyCodes as AgriCategory[] } },
  });
  for (const p of providers) {
    const { to, service } = LEGACY_AGRI_CATEGORY_MAP[p.agriCategory as keyof typeof LEGACY_AGRI_CATEGORY_MAP];
    const agriServices = service && !p.agriServices.includes(service) ? [...p.agriServices, service] : p.agriServices;
    const serviceDistricts = p.serviceDistricts.length === 0 && p.district ? [p.district] : p.serviceDistricts;
    console.log(
      `provider ${p.displayName.padEnd(18)} ${p.agriCategory} → ${to}` +
        (service ? ` + service "${service}"` : "") +
        (serviceDistricts !== p.serviceDistricts ? ` · districts [${serviceDistricts.join(", ")}]` : ""),
    );
    if (apply) {
      await prisma.providerProfile.update({
        where: { id: p.id },
        data: { agriCategory: to, agriServices, serviceDistricts },
      });
    }
  }

  let bookingCount = 0;
  for (const code of legacyCodes) {
    const to = LEGACY_AGRI_CATEGORY_MAP[code].to;
    const where = { agriCategory: code as AgriCategory };
    const n = apply
      ? (await prisma.booking.updateMany({ where, data: { agriCategory: to } })).count
      : await prisma.booking.count({ where });
    if (n) console.log(`bookings  ${code} → ${to}: ${n}`);
    bookingCount += n;
  }

  console.log(
    `\n${apply ? "Updated" : "Would update"} ${providers.length} provider(s) and ${bookingCount} booking(s).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
