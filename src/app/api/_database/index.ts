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

/**
 * Cloudflare D1 caps bound parameters per query at 98 (see
 * `@prisma/adapter-d1/.../index-workerd.mjs:MAX_BIND_VALUES`). Prisma 7's
 * query-plan executor can only chunk a single `IN (…)` fragment per query —
 * any second IN-tuple (e.g. an `include`/nested `select` fetching child rows
 * with `parentId IN (…manyIds)`) will throw P2029 once the dataset is large.
 *
 * Use this helper to manually batch any `WHERE id IN (…)` lookup over an
 * arbitrarily large array. Default chunk size leaves headroom for additional
 * bound params in the same statement (e.g. soft-delete filters).
 *
 * Example:
 *   const stats = await chunkedInQuery(statIds, (chunk) =>
 *     prisma.playerRole.findMany({ where: { gamePlayerStatisticsId: { in: chunk } } })
 *   );
 */
export async function chunkedInQuery<T>(
  ids: readonly number[] | readonly string[],
  fetchFn: (chunk: number[] & string[]) => Promise<T[]>,
  chunkSize: number = 90,
): Promise<T[]> {
  if (ids.length === 0) return [];
  const results: T[] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize) as number[] & string[];
    results.push(...(await fetchFn(chunk)));
  }
  return results;
}
