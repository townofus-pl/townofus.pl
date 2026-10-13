import { NextRequest } from 'next/server';
import { database } from '../_accounts/server';
import { getHandler } from './get';

jest.mock('../_accounts/server', () => ({ database: jest.fn() }));

const first = jest.fn();
const bind = jest.fn(() => ({ first }));
const prepare = jest.fn((_sql: string) => ({ bind }));

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(database).mockResolvedValue({ prepare } as unknown as D1Database);
});

async function location(query: string) {
    const response = await getHandler(new NextRequest(`http://localhost:3000/dramaafera/avatar?${query}`));
    expect(response.status).toBe(302);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    return response.headers.get('Location');
}

it('uses the linked Discord avatar even when a special ranking fallback is requested', async () => {
    first.mockResolvedValue({ discordUserId: '123', avatar: 'a_abc' });
    expect(await location('name=Malkiz&fallback=papaj')).toBe('https://cdn.discordapp.com/avatars/123/a_abc.gif?size=128');
    expect(bind).toHaveBeenCalledWith('Malkiz');
    expect(prepare.mock.calls[0][0]).toContain('a.playerId=p.id');
    expect(prepare.mock.calls[0][0]).toContain('a.deletedAt IS NULL');
    expect(prepare.mock.calls[0][0]).toContain('p.deletedAt IS NULL');
});

it('uses the default Discord avatar for a linked account without a custom image', async () => {
    first.mockResolvedValue({ discordUserId: '4194304', avatar: null });
    expect(await location('name=Malkiz')).toBe('https://cdn.discordapp.com/embed/avatars/1.png');
});

it('keeps local avatars for unlinked players and encodes their names', async () => {
    first.mockResolvedValue(null);
    expect(await location('name=A%20%23B')).toBe('http://localhost:3000/images/avatars/A%20%23B.png');
    expect(await location('name=Malkiz&fallback=papaj')).toBe('http://localhost:3000/images/avatars/papaj.jpg');
});

it('rejects invalid requests without querying the database', async () => {
    const response = await getHandler(new NextRequest('http://localhost:3000/dramaafera/avatar?name='));
    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
});
