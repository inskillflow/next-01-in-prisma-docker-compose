import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Debug: Hardcode URL temporairement
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_z1cN6qYxVFMB@ep-sparkling-hill-ae6xwlzp-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 