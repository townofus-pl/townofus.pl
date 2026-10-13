import { webcrypto } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { POST as requestLink } from '../konto/api/post';
import { DELETE as closeAccount } from '../konto/api/delete';
import { POST as hostDecision } from '../host/konta/post';
import { GET as hostAccounts } from '../host/konta/get';
import { GET as callback } from '../auth/callback/get';
import { GET as login } from '../auth/login/get';
import { POST as logout } from '../auth/logout/post';
import { database, session, oauthConfig } from './server';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
import { sameOrigin, hashToken } from './security';
jest.mock('./server', () => ({
    database: jest.fn(),
    session: jest.fn(),
    oauthConfig: jest.fn(),
    json: (data: unknown, status = 200) =>
        NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } }),
    error: (error: string, status = 400) =>
        NextResponse.json({ success: false, error }, { status }),
    mutationAllowed: (request: Request) => sameOrigin(request),
    safeHandler: async (work: () => Promise<Response>) => {
        try {
            return await work();
        } catch {
            return NextResponse.json({ success: false }, { status: 409 });
        }
    },
}));
jest.mock('@/app/api/_middlewares/hostAuth', () => ({ authenticateHostHeaders: jest.fn() }));
const account = {
    id: 7,
    username: 'tester',
    discordUserId: '123456789',
    avatar: null,
    playerId: null,
    retryBlocked: 0,
    version: 0,
};
const mockFirst = jest.fn(),
    mockAll = jest.fn(),
    mockRun = jest.fn(),
    mockBind = jest.fn();
const statement = { bind: mockBind, first: mockFirst, all: mockAll, run: mockRun };
const db = { prepare: jest.fn(() => statement), batch: jest.fn() };
const origin = 'https://townofus.pl';
function req(path: string, body?: unknown, headers: Record<string, string> = {}) {
    return new NextRequest(origin + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { origin, 'Content-Type': 'application/json', ...headers },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
}
beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    mockBind.mockReturnValue(statement);
    mockRun.mockResolvedValue({ success: true });
    mockFirst.mockResolvedValue({ id: 1 });
    mockAll.mockResolvedValue({ results: [] });
    db.batch.mockResolvedValue([]);
    jest.mocked(database).mockResolvedValue(db as unknown as D1Database);
    jest.mocked(session).mockResolvedValue(account);
    jest.mocked(authenticateHostHeaders).mockResolvedValue({ success: false });
    jest.mocked(oauthConfig).mockResolvedValue({
        clientId: 'app',
        clientSecret: 'secret',
        redirectUri: origin + '/dramaafera/auth/callback',
    });
});
test('forged accountId is rejected and writes use only session identity', async () => {
    expect(
        (await requestLink(req('/dramaafera/konto/api', { playerId: 1, accountId: 999 }))).status,
    ).toBe(400);
    expect(db.prepare).not.toHaveBeenCalled();
    expect((await requestLink(req('/dramaafera/konto/api', { playerId: 1 }))).status).toBe(200);
    expect(mockBind).toHaveBeenCalledWith(7, 1, 7, 1);
});
test('no session and cross-site mutations are refused', async () => {
    jest.mocked(session).mockResolvedValue(null);
    expect((await requestLink(req('/dramaafera/konto/api', { playerId: 1 }))).status).toBe(401);
    jest.mocked(session).mockResolvedValue(account);
    expect(
        (
            await requestLink(
                req('/dramaafera/konto/api', { playerId: 1 }, { origin: 'https://evil.example' }),
            )
        ).status,
    ).toBe(403);
    expect(
        (await closeAccount(req('/dramaafera/konto/api', {}, { origin: 'https://evil.example' })))
            .status,
    ).toBe(403);
    expect(db.prepare).not.toHaveBeenCalled();
});
test('Discord session alone never authorizes a host read or decision', async () => {
    expect((await hostAccounts(req('/dramaafera/host/konta'))).status).toBe(403);
    expect(
        (
            await hostDecision(
                req('/dramaafera/host/konta', {
                    accountId: 7,
                    expectedVersion: 0,
                    action: 'correct',
                    playerId: 1,
                    reason: 'correct',
                }),
            )
        ).status,
    ).toBe(403);
    expect(db.batch).not.toHaveBeenCalled();
    expect(db.prepare).not.toHaveBeenCalled();
});
test('host commands require version, reason, Basic Auth and same Origin', async () => {
    jest.mocked(authenticateHostHeaders).mockResolvedValue({
        success: true,
        user: { username: 'shared-host' },
    });
    const body = {
        accountId: 7,
        expectedVersion: 0,
        action: 'approve',
        requestId: 1,
        reason: 'Sprawdzono',
    };
    expect(
        (await hostDecision(req('/dramaafera/host/konta', { ...body, reason: '' }))).status,
    ).toBe(400);
    expect(
        (
            await hostDecision(
                req('/dramaafera/host/konta', body, { origin: 'https://evil.example' }),
            )
        ).status,
    ).toBe(403);
    expect((await hostDecision(req('/dramaafera/host/konta', body))).status).toBe(200);
    expect(mockBind).toHaveBeenCalledWith(
        expect.any(String),
        7,
        'approve',
        1,
        null,
        0,
        'shared-host',
        null,
        null,
        'Sprawdzono',
    );
    expect(db.batch).toHaveBeenCalledTimes(1);
});
test('close physically deletes only session account and clears its cookie', async () => {
    const response = await closeAccount(req('/dramaafera/konto/api', {}));
    expect(response.status).toBe(200);
    expect(db.prepare).toHaveBeenCalledWith('DELETE FROM discord_accounts WHERE id=?');
    expect(mockBind).toHaveBeenCalledWith(7);
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
});
test('logout revokes a token hash rather than storing the cookie token', async () => {
    const token = 'a'.repeat(64);
    const response = await logout(
        req('/dramaafera/auth/logout', {}, { cookie: `dramaafera_session=${token}` }),
    );
    expect(response.status).toBe(200);
    expect(mockBind).toHaveBeenCalledWith(await hashToken(token));
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
});
test('callback rejects missing/mismatched/consumed state before any Discord request', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch');
    const state = 'a'.repeat(64);
    expect(
        (await callback(req('/dramaafera/auth/callback?state=' + state + '&code=code'))).status,
    ).toBe(400);
    mockFirst.mockResolvedValue(null);
    expect(
        (
            await callback(
                req('/dramaafera/auth/callback?state=' + state + '&code=code', undefined, {
                    cookie: `dramaafera_oauth_state=${state}`,
                }),
            )
        ).status,
    ).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
});
test('OAuth callback exchanges code only on server, hashes session and revokes Discord token', async () => {
    const fetchMock = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ access_token: 'private-token', token_type: 'Bearer' })),
        )
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ id: '123456789', username: 'tester', avatar: null })),
        )
        .mockResolvedValueOnce(new Response('{}'));
    const state = 'a'.repeat(64);
    const response = await callback(
        req('/dramaafera/auth/callback?state=' + state + '&code=code', undefined, {
            cookie: `dramaafera_oauth_state=${state}`,
        }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(origin + '/dramaafera/konto');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Secure');
    expect(response.headers.get('set-cookie')).not.toContain('private-token');
    expect(fetchMock.mock.calls[0][0]).toBe('https://discord.com/api/oauth2/token');
    expect(fetchMock.mock.calls[2][0]).toBe('https://discord.com/api/oauth2/token/revoke');
    expect(JSON.stringify(mockBind.mock.calls)).not.toContain('private-token');
    fetchMock.mockRestore();
});
test('login missing credentials is reviewable without real Discord setup', async () => {
    jest.mocked(oauthConfig).mockResolvedValue(null);
    expect((await login(req('/dramaafera/auth/login'))).status).toBe(503);
    expect(db.batch).not.toHaveBeenCalled();
});
test('login asks only identify and binds state to a scoped HttpOnly cookie', async () => {
    const response = await login(req('/dramaafera/auth/login'));
    const url = new URL(response.headers.get('location')!);
    expect(url.searchParams.get('scope')).toBe('identify');
    expect(url.searchParams.get('state')).toHaveLength(64);
    expect(response.headers.get('set-cookie')).toContain('Path=/dramaafera');
});

test('host grant requires typed nickname and forwards confirmation to the atomic guard',async()=>{
 jest.mocked(authenticateHostHeaders).mockResolvedValue({success:true,user:{username:'Host Discord',accountId:3}});
 const body={accountId:7,expectedVersion:0,action:'grantHost',reason:'Sprawdzono hosta'};
 expect((await hostDecision(req('/dramaafera/host/konta',body))).status).toBe(400);
 expect(db.batch).not.toHaveBeenCalled();
 expect((await hostDecision(req('/dramaafera/host/konta',{...body,confirmationNickname:'tester'}))).status).toBe(200);
 expect(mockBind).toHaveBeenCalledWith(expect.any(String),7,'grantHost',null,null,0,'Host Discord',3,'tester','Sprawdzono hosta');
});
