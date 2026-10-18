/**
 * Runs after `prisma db push`. `User.email` / `User.phone` are optional but
 * must be unique when set. A plain MongoDB unique index (what Prisma's
 * @unique creates) treats every missing value as `null`, so the second user
 * without an email would collide — and Prisma can't express partial indexes.
 * So those fields carry no @unique in the schema, and this script owns
 * their indexes instead.
 *
 * Run with: npm run db:push
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const OPTIONAL_UNIQUE: { collection: string; field: string; name: string }[] = [
  { collection: "User", field: "email", name: "User_email_key" },
  { collection: "User", field: "phone", name: "User_phone_key" },
];

async function main() {
  for (const { collection, field, name } of OPTIONAL_UNIQUE) {
    try {
      await prisma.$runCommandRaw({ dropIndexes: collection, index: name });
    } catch {
      // index didn't exist yet — fine
    }
    await prisma.$runCommandRaw({
      createIndexes: collection,
      indexes: [
        {
          key: { [field]: 1 },
          name,
          unique: true,
          partialFilterExpression: { [field]: { $type: "string" } },
        },
      ],
    });
    console.log(`${collection}.${field}: partial unique index ready`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
