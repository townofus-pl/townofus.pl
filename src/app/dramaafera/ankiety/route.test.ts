import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
import { database, session } from '../_accounts/server';
import { createPoll, readPoll } from '../_polls/server';

jest.mock('../_accounts/server', () => ({
    database: jest.fn(), session: jest.fn(),
    json: (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } }),
    error: (error: string, status = 400) => NextResponse.json({ error }, { status }),
    safeHandler: async (work: () => Promise<Response>) => work(),
}));
jest.mock('../_polls/server', () => ({ createPoll: jest.fn(), readPoll: jest.fn(), previewCandidates: jest.fn().mockResolvedValue([]) }));
jest.mock('@/app/api/_middlewares/hostAuth', () => ({ authenticateHostHeaders: jest.fn() }));
const db = { prepare: jest.fn() };
function request(body: unknown, origin = 'https://townofus.pl') {
    return new NextRequest('https://townofus.pl/dramaafera/ankiety', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(database).mockResolvedValue(db as unknown as D1Database);
    jest.mocked(session).mockResolvedValue(null);
    jest.mocked(readPoll).mockResolvedValue(null);
    jest.mocked(authenticateHostHeaders).mockResolvedValue({ success: false });
});
test('public preview of absent poll never challenges anonymous visitor', async () => {
    const response = await GET(new NextRequest('https://townofus.pl/dramaafera/ankiety?date=20261012&season=4'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ poll: null, canCreate: false });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
});
test('cross-site creation is rejected before touching database', async () => {
    const response = await POST(request({ date: '20261012', season: 4, action: 'create' }, 'https://evil.example'));
    expect(response.status).toBe(403);
    expect(database).not.toHaveBeenCalled();
});
test('ordinary account cannot create polls', async () => {
    const response = await POST(request({ date: '20261012', season: 4, action: 'create' }));
    expect(response.status).toBe(403);
    expect(createPoll).not.toHaveBeenCalled();
});
test('Basic host can create but cannot vote without Discord session', async () => {
    jest.mocked(authenticateHostHeaders).mockResolvedValue({ success: true, user: { username: 'host' } });
    expect((await POST(request({ date: '20261012', season: 4, action: 'create' }))).status).toBe(201);
    expect(createPoll).toHaveBeenCalledWith(db, '20261012', 4, null);
    expect((await POST(request({ date: '20261012', season: 4, action: 'vote', candidateId: 1 }))).status).toBe(401);
});
test('invalid day and candidate are rejected', async () => {
    expect((await POST(request({ date: '20260230', season: 4, action: 'create' }))).status).toBe(400);
    expect((await POST(request({ date: '20261012', season: 4, action: 'vote', candidateId: -1 }))).status).toBe(400);
});
