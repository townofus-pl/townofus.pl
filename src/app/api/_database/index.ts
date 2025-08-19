import { PrismaClient } from '@/generated/prisma';
import { PrismaD1 } from '@prisma/adapter-d1';

/**
 * Global Prisma client instance
 */
let prisma: PrismaClient | null = null;

/**
 * Get or create Prisma client with D1 adapter
 */
export function getPrismaClient(d1Database: D1Database): PrismaClient {
  if (!prisma) {
    const adapter = new PrismaD1(d1Database);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

/**
 * Close Prisma client connection
 */
export async function closePrismaClient(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Type exports from Prisma - use these instead of manual definitions
 */
export type { Prisma, Fruit } from '../../../generated/prisma';

/**
 * Database query helpers
 */

// Pagination helper for database queries
export interface DatabasePaginationOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export function buildPaginationQuery(options: DatabasePaginationOptions = {}) {
  const {
    skip = 0,
    take = 10,
    orderBy = { createdAt: 'desc' }
  } = options;

  return {
    skip: Math.max(0, skip),
    take: Math.min(100, Math.max(1, take)), // Limit to max 100 items
    orderBy
  };
}

// Search helper for text fields
export function buildSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm.trim()) {
    return undefined;
  }

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    }))
  };
}

/**
 * Database connection health check
 */
export async function checkDatabaseConnection(d1Database: D1Database): Promise<boolean> {
  try {
    const client = getPrismaClient(d1Database);
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Database transaction helper
 */
export async function withTransaction<T>(
  d1Database: D1Database,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient(d1Database);
  return await client.$transaction(async (tx) => {
    return callback(tx as PrismaClient);
  });
}