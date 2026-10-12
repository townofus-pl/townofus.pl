import { webcrypto } from 'node:crypto';
import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { session, json, oauthConfig } from './server';
import { hashToken } from './security';
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
const first = jest.fn();
const bind = jest.fn(() => ({ first }));
const prepare = jest.fn((_sql: string) => ({ bind }));
beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    jest.mocked(getCloudflareContext).mockReturnValue({
        env: { DB: { prepare } },
        ctx: {},
        cf: {},
    } as unknown as ReturnType<typeof getCloudflareContext>);
});
test('missing or malformed cookie does not query D1', async () => {
    expect(await session(new NextRequest('https://townofus.pl/dramaafera/konto/api'))).toBeNull();
    expect(
        await session(
            new NextRequest('https://townofus.pl/dramaafera/konto/api', {
                headers: { cookie: 'dramaafera_session=bad' },
            }),
        ),
    ).toBeNull();
    expect(prepare).not.toHaveBeenCalled();
});
test('session lookup hashes token, checks expiry and excludes deleted accounts/sessions', async () => {
    const token = 'b'.repeat(64);
    first.mockResolvedValue(null);
    expect(
        await session(
            new NextRequest('https://townofus.pl/dramaafera/konto/api', {
                headers: { cookie: `dramaafera_session=${token}` },
            }),
        ),
    ).toBeNull();
    expect(bind).toHaveBeenCalledWith(await hashToken(token), expect.any(Number));
    expect(prepare.mock.calls[0][0]).toContain('s.expiresAt>?');
    expect(prepare.mock.calls[0][0]).toContain('s.deletedAt IS NULL AND a.deletedAt IS NULL');
});
test('private JSON cannot be cached', () => {
    expect(json({ username: 'private' }).headers.get('cache-control')).toBe('no-store');
});
test('OAuth configuration refuses unrelated/insecure callback addresses', async () => {
    const original = {
        id: process.env.DISCORD_CLIENT_ID,
        secret: process.env.DISCORD_CLIENT_SECRET,
        uri: process.env.DISCORD_REDIRECT_URI,
    };
    try {
        process.env.DISCORD_CLIENT_ID = 'app';
        process.env.DISCORD_CLIENT_SECRET = 'secret';
        process.env.DISCORD_REDIRECT_URI = 'http://townofus.pl/dramaafera/auth/callback';
        expect(await oauthConfig()).toBeNull();
        process.env.DISCORD_REDIRECT_URI = 'https://townofus.pl/wrong';
        expect(await oauthConfig()).toBeNull();
        process.env.DISCORD_REDIRECT_URI = 'http://localhost:3000/dramaafera/auth/callback';
        expect(await oauthConfig()).not.toBeNull();
    } finally {
        for (const [key, value] of Object.entries({
            DISCORD_CLIENT_ID: original.id,
            DISCORD_CLIENT_SECRET: original.secret,
            DISCORD_REDIRECT_URI: original.uri,
        })) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});
