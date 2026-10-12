import { webcrypto } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { authenticateHeaders } from './auth';
import { authenticateHostHeaders, withHostAuth } from './hostAuth';
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('./auth', () => ({ authenticateHeaders: jest.fn() }));
const first = jest.fn(),
    bind = jest.fn(() => ({ first })),
    prepare = jest.fn((_sql: string) => ({ bind }));
beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    first.mockResolvedValue(null);
    jest.mocked(getCloudflareContext).mockReturnValue({
        env: { DB: { prepare } },
    } as unknown as ReturnType<typeof getCloudflareContext>);
    jest.mocked(authenticateHeaders).mockResolvedValue({
        success: false,
        response: NextResponse.json({ error: 'denied' }, { status: 403 }),
    });
});
test('ordinary Discord account cannot access host tools', async () => {
    expect(
        (
            await authenticateHostHeaders(
                new Headers({ cookie: 'dramaafera_session=' + 'a'.repeat(64) }),
            )
        ).success,
    ).toBe(false);
    expect(prepare.mock.calls[0][0]).toContain('a.isHost=1');
    expect(prepare.mock.calls[0][0]).toContain('s.expiresAt>?');
});
test('granted Discord session needs no Basic credentials and revocation is read on every call', async () => {
    first.mockResolvedValueOnce({ id: 7 }).mockResolvedValueOnce(null);
    const h = new Headers({ cookie: 'dramaafera_session=' + 'a'.repeat(64) });
    expect(await authenticateHostHeaders(h)).toEqual({
        success: true,
        user: { username: 'Host Discord', accountId: 7 },
    });
    expect(authenticateHeaders).not.toHaveBeenCalled();
    expect((await authenticateHostHeaders(h)).success).toBe(false);
    expect(prepare).toHaveBeenCalledTimes(2);
});
test('existing Basic host can bootstrap permissions', async () => {
    jest.mocked(authenticateHeaders).mockResolvedValue({
        success: true,
        user: { username: 'basic-host' },
    });
    expect(
        (await authenticateHostHeaders(new Headers({ Authorization: 'Basic test' }))).success,
    ).toBe(true);
});
test('host mutations require same Origin and never call the tool when denied', async () => {
    first.mockResolvedValue({ id: 7 });
    const tool = jest.fn(async () => NextResponse.json({ success: true }));
    const handler = withHostAuth(tool);
    const make = (origin: string) =>
        new NextRequest('https://townofus.pl/dramaafera/host/games', {
            method: 'POST',
            headers: { cookie: 'dramaafera_session=' + 'a'.repeat(64), origin },
        });
    expect((await handler(make('https://evil.example'))).status).toBe(403);
    expect(tool).not.toHaveBeenCalled();
    expect((await handler(make('https://townofus.pl'))).status).toBe(200);
    expect(tool).toHaveBeenCalledTimes(1);
});
