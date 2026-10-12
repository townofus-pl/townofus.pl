import { loadMoreTopGames } from './topGamesActions';
import { TOP_GAMES_INITIAL, TOP_GAMES_PAGE } from './topGamesConfig';
import { getPlayerTopGames } from '../../_services/players/getPlayerTopGames';

jest.mock('../../_services/players/getPlayerTopGames', () => ({
  getPlayerTopGames: jest.fn(),
}));

const getGames = jest.mocked(getPlayerTopGames);

beforeEach(() => getGames.mockReset());

test('loads seven after the initial three, then ten at each subsequent offset in the selected season', async () => {
  getGames.mockResolvedValue({ best: [], hasMore: true });
  for (const offset of [TOP_GAMES_INITIAL, TOP_GAMES_PAGE, TOP_GAMES_PAGE * 2, TOP_GAMES_PAGE * 3]) {
    await loadMoreTopGames('Malkiz', 4, offset);
    expect(getGames).toHaveBeenLastCalledWith('Malkiz', offset === TOP_GAMES_INITIAL ? TOP_GAMES_PAGE - TOP_GAMES_INITIAL : TOP_GAMES_PAGE, 4, offset);
  }
});

test('passes the exhaustion flag to the client', async () => {
  const result = { best: [], hasMore: false };
  getGames.mockResolvedValue(result);
  expect(await loadMoreTopGames('Malkiz', 4, 30)).toEqual(result);
});

test.each([-1, 0, TOP_GAMES_INITIAL - 1, TOP_GAMES_INITIAL + 0.5, NaN])('rejects invalid offset %s without querying games', async (offset) => {
  await expect(loadMoreTopGames('Malkiz', 4, offset)).rejects.toThrow();
  expect(getGames).not.toHaveBeenCalled();
});
