import { webcrypto } from 'node:crypto';
import {
    cookieOptions,
    hashToken,
    randomToken,
    sameOrigin,
    validToken,
    SESSION_SECONDS,
} from './security';
beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
});
test('session is three days and tokens have 256 bits of entropy', async () => {
    expect(SESSION_SECONDS).toBe(259200);
    const a = randomToken(),
        b = randomToken();
    expect(validToken(a)).toBe(true);
    expect(a).not.toBe(b);
    expect(await hashToken(a)).toHaveLength(64);
    expect(await hashToken(a)).not.toBe(a);
    expect(await hashToken(a)).toBe(await hashToken(a));
    expect(validToken('forged')).toBe(false);
});
test('cookies are restricted to Drama Afera and secure on HTTPS', () => {
    expect(cookieOptions('https://townofus.pl', 3)).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/dramaafera',
        maxAge: 3,
    });
    expect(cookieOptions('http://localhost:3000', 3).secure).toBe(false);
});
test('mutations require an exact Origin and reject cross-site requests', () => {
    const request = (origin?: string, site?: string) =>
        new Request('https://townofus.pl/dramaafera/konto/api', {
            headers: { ...(origin ? { origin } : {}), ...(site ? { 'sec-fetch-site': site } : {}) },
        });
    expect(sameOrigin(request('https://townofus.pl', 'same-origin'))).toBe(true);
    expect(sameOrigin(request())).toBe(false);
    expect(sameOrigin(request('https://evil.example'))).toBe(false);
    expect(sameOrigin(request('https://townofus.pl', 'cross-site'))).toBe(false);
});
