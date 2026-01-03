import "dotenv/config";
import { prisma } from "@repo/database";

async function makeAdmin() {
  const user = await prisma.user.update({
    where: { email: "kyrkyma404@gmail.com" },
    data: { role: "ADMIN" },
  });

  console.log(`User ${user.email} is now ${user.role}`);
  await prisma.$disconnect();
}

makeAdmin();
