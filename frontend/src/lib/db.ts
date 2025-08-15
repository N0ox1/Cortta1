import { PrismaClient } from "@prisma/client";

// Requer DATABASE_URL na Vercel (Railway Postgres)
// ...?pgbouncer=true&sslmode=require&connect_timeout=5&pool_timeout=5
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
