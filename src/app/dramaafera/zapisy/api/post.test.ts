import { NextRequest } from 'next/server';
import { postHandler } from './post';
import { changeSignup } from '../../_signups/storage';

jest.mock('../../_accounts/server', () => ({
    database: jest.fn(async () => ({})),
    mutationAllowed: (request: Request) => request.headers.get('origin') === new URL(request.url).origin,
    safeHandler: (work: () => Promise<Response>) => work(),
    error: (message: string, status = 400) => Response.json({ error: message }, { status }),
    json: (data: unknown) => Response.json(data),
}));
jest.mock('../../_signups/storage', () => ({ changeSignup: jest.fn() }));
jest.mock('../../_accounts/security', () => ({
    SESSION_COOKIE: 'dramaafera_session',
    validToken: (value: string | undefined) => value === 'valid',
    hashToken: jest.fn(async () => 'hash'),
}));

function request(body: unknown, origin = 'http://localhost:3000', cookie = 'dramaafera_session=valid') {
    return new NextRequest('http://localhost:3000/dramaafera/zapisy/api', {
        method: 'POST', headers: { origin, cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
}
beforeEach(() => jest.clearAllMocks());

it('rejects cross-origin requests and users without a session before any mutation', async () => {
    expect((await postHandler(request({ action: 'join', date: '2026-10-14' }, 'https://example.com'))).status).toBe(403);
    expect((await postHandler(request({ action: 'join', date: '2026-10-14' }, undefined, ''))).status).toBe(401);
    expect(changeSignup).not.toHaveBeenCalled();
});
it('does not let the browser choose another player', async () => {
    expect((await postHandler(request({ action: 'join', date: '2026-10-14', playerId: 99 }))).status).toBe(400);
    expect(changeSignup).not.toHaveBeenCalled();
});
it('passes only the session identity and date to the atomic write', async () => {
    jest.mocked(changeSignup).mockResolvedValue(true);
    expect((await postHandler(request({ action: 'leave', date: '2026-10-14' }))).status).toBe(200);
    expect(changeSignup).toHaveBeenCalledWith({}, 'hash', '2026-10-14', false);
});
it('reports a stale week or missing live player link as a conflict', async () => {
    jest.mocked(changeSignup).mockResolvedValue(false);
    expect((await postHandler(request({ action: 'join', date: '2000-01-05' }))).status).toBe(409);
});
