export const SESSION_SECONDS = 3 * 24 * 60 * 60;
export const SESSION_COOKIE = 'dramaafera_session';
export const STATE_COOKIE = 'dramaafera_oauth_state';
export function randomToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
        n.toString(16).padStart(2, '0'),
    ).join('');
}
export async function hashToken(token: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    return Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, '0')).join('');
}
export function validToken(value: string | undefined): value is string {
    return !!value && /^[a-f0-9]{64}$/.test(value);
}
export function sameOrigin(request: Request): boolean {
    return (
        request.headers.get('origin') === new URL(request.url).origin &&
        !['cross-site', 'none'].includes(request.headers.get('sec-fetch-site') ?? '')
    );
}
export function cookieOptions(url: string, maxAge: number) {
    return {
        httpOnly: true,
        secure: new URL(url).protocol === 'https:',
        sameSite: 'lax' as const,
        path: '/dramaafera',
        maxAge,
    };
}
