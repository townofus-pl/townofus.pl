import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';

/**
 * Sprawdza nagłówek Basic Auth w akcji serwera.
 *
 * `src/middleware.ts` chroni strony hosta, ale akcja serwera to osobna ścieżka
 * wejścia: da się ją wywołać bez otwierania strony. Dlatego każda akcja, która
 * oddaje dane hosta albo coś zapisuje, sprawdza login sama.
 */
export async function requireHostAuth(): Promise<void> {
  const auth = await authenticateHeaders(await headers());
  if (!auth.success) {
    throw new Error('Brak autoryzacji');
  }
}
