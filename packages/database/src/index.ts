import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
// From packages/database/src, we need to go up to the monorepo root
// The path structure is: packages/database/src -> packages/database -> packages -> BookingApp (monorepo root)
let projectRoot = path.resolve(__dirname, "../../", "../../");
// If we end up at 'Project' level, we need to go into 'BookingApp'
if (projectRoot.endsWith("Project")) {
  projectRoot = path.join(projectRoot, "BookingApp");
}
const envPath = path.join(projectRoot, ".env");
dotenv.config({ path: envPath });

export * from "@prisma/client";
export type { PrismaClient };

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const url = new URL(DATABASE_URL);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({
    log: ["query"],
    adapter,
  }) as PrismaClient;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;