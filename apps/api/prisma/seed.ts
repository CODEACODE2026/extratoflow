import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@extratoflow.local";
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Administrador";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin12345";

const run = async () => {
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must have at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: UserRole.admin
    },
    update: {
      name: ADMIN_NAME,
      passwordHash,
      role: UserRole.admin,
      status: "active"
    },
    where: {
      email: ADMIN_EMAIL
    }
  });

  console.log(`Admin user ready: ${ADMIN_EMAIL}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
