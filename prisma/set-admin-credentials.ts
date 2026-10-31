/**
 * Changes an admin account's login phone and password.
 *
 *   NEW_ADMIN_PASSWORD='…' npm run admin:set-credentials -- --from 9900000000 --phone 7389233671
 *
 * The password is read from the NEW_ADMIN_PASSWORD environment variable so it
 * never lands in the code or in git. It's hashed the same way as sign-up, and
 * any outstanding password-reset links for the account are deleted.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1]?.trim() : undefined;
}

const from = arg("from");
const phone = arg("phone");
const password = process.env.NEW_ADMIN_PASSWORD ?? "";

if (!from || !phone) {
  console.error("Usage: NEW_ADMIN_PASSWORD='…' npm run admin:set-credentials -- --from <current phone> --phone <new phone>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Set NEW_ADMIN_PASSWORD to the new password (at least 8 characters).");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { phone: from, role: "ADMIN" } });
  if (!admin) throw new Error(`No admin account with phone ${from}`);

  if (phone !== from) {
    const taken = await prisma.user.findFirst({ where: { phone } });
    if (taken) throw new Error(`Phone ${phone} is already used by ${taken.name}`);
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { phone, passwordHash: await bcrypt.hash(password, 10), active: true },
  });
  const resets = await prisma.passwordResetToken.deleteMany({ where: { userId: admin.id } });

  console.log(`Updated ${admin.name}: login phone ${from} → ${phone}, new password set.`);
  if (resets.count) console.log(`Removed ${resets.count} pending password-reset link(s).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
