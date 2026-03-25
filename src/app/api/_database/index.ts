import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import type { Prisma } from '@prisma/client';



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
    prisma = new PrismaClient({
      adapter
    });
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
export type { Prisma };

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



/**
 * Database connection health check
 */
export async function checkDatabaseConnection(d1Database: D1Database): Promise<boolean> {
  try {
    const client = getPrismaClient(d1Database);
    // Simple health check using a standard Prisma query instead of raw SQL
    await client.player.findFirst({
      select: { id: true },
      take: 1
    });
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Execute multiple raw SQL statements atomically using D1's batch() API.
 *
 * D1 does not support Prisma interactive transactions ($transaction callback style).
 * For atomic multi-statement operations, use env.DB.batch() with raw prepared statements.
 *
 * Example:
 *   await batchStatements(env.DB, [
 *     env.DB.prepare('UPDATE players SET rating = ? WHERE id = ?').bind(newRating, playerId),
 *     env.DB.prepare('INSERT INTO player_rankings (player_id, ...) VALUES (?, ...)').bind(playerId, ...),
 *   ]);
 */
export async function batchStatements(
  d1Database: D1Database,
  statements: D1PreparedStatement[]
): Promise<D1Result[]> {
  return d1Database.batch(statements);
}
