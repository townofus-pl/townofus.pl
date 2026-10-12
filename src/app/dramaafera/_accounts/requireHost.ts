import 'server-only';
import { headers } from 'next/headers';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
export async function requireHost() {
    const result = await authenticateHostHeaders(await headers());
    if (!result.success || !result.user) throw new Error('Brak uprawnień hosta.');
    return result.user;
}

export async function requireHostMutation() {
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');
    const host = requestHeaders.get('host');
    const scheme =
        requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim() ??
        (host?.startsWith('localhost:') ? 'http' : 'https');
    if (!origin || !host || new URL(origin).origin !== `${scheme}://${host}`)
        throw new Error('Niedozwolone źródło żądania.');
    return requireHost();
}
