import { loadSummaryPoll } from './server';
import { readPoll } from './storage';
import { getCloudflareContext } from '@opennextjs/cloudflare';
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('../_accounts/server', () => ({ database: jest.fn().mockResolvedValue({}) }));
jest.mock('./storage', () => ({ readPoll: jest.fn() }));
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
const assets = { fetch: jest.fn() };
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCloudflareContext).mockReturnValue({ env: { ASSETS: assets } } as unknown as ReturnType<typeof getCloudflareContext>);
});
test('D1 poll with zero votes supersedes historical JSON', async () => {
    jest.mocked(readPoll).mockResolvedValue({ id: 1, date: '20261007', season: 4, closesAt: 100, closed: true, playerId: null, selectedCandidateId: null, totalVotes: 0,
        candidates: [{ id: 2, playerId: 7, nickname: 'Gracz', totalPoints: 10, votes: 0 }] });
    expect(await loadSummaryPoll('20261007', 4)).toEqual({ date: '20261007', question: 'Kto zostanie Emperorem?', totalVotes: 0, votes: [{ nickname: 'Gracz', votes: 0 }] });
    expect(assets.fetch).not.toHaveBeenCalled();
});
test('historical JSON is read only when D1 poll does not exist in this season', async () => {
    jest.mocked(readPoll).mockResolvedValue(null);
    const historical = { date: '20260930', question: 'Emperor?', totalVotes: 5, votes: [{ nickname: 'Dawny', votes: 5 }] };
    assets.fetch.mockResolvedValue(Response.json(historical));
    expect(await loadSummaryPoll('20260930', 4)).toEqual(historical);
    expect(readPoll).toHaveBeenCalledWith({}, '20260930', 4);
});
test('missing historical JSON has no poll', async () => {
    jest.mocked(readPoll).mockResolvedValue(null);
    assets.fetch.mockResolvedValue(new Response('', { status: 404 }));
    expect(await loadSummaryPoll('20260930', 4)).toBeNull();
});
