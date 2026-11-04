import { describe, expect, it } from '@jest/globals';
import { DEFAULT_PLAYER_SORT, nextPlayerSort, sortPlayers } from './sortPlayers';

const player = (name: string, games: number, wins: number) => ({
  name,
  games,
  wins,
  loses: games - wins,
  winRatio: Math.round((wins / games) * 10000) / 100,
});

// Kolejność jak z serwera: W/R malejąco, potem wygrane, potem nazwa.
const players = [
  player('Żaneta', 4, 4),
  player('Adam', 10, 7),
  player('Łukasz', 10, 5),
  player('Basia', 2, 1),
  player('Zenek', 8, 2),
];

const names = (list: { name: string }[]) => list.map((p) => p.name);

describe('sortPlayers', () => {
  it('keeps the server order for the default sort', () => {
    expect(names(sortPlayers(players, DEFAULT_PLAYER_SORT))).toEqual(names(players));
  });

  it('sorts numeric columns in both directions', () => {
    expect(names(sortPlayers(players, { key: 'loses', ascending: false }))).toEqual([
      'Zenek', 'Łukasz', 'Adam', 'Basia', 'Żaneta',
    ]);
    expect(names(sortPlayers(players, { key: 'wins', ascending: true }))).toEqual([
      'Basia', 'Zenek', 'Żaneta', 'Łukasz', 'Adam',
    ]);
  });

  it('sorts names with the Polish alphabet', () => {
    expect(names(sortPlayers(players, { key: 'name', ascending: true }))).toEqual([
      'Adam', 'Basia', 'Łukasz', 'Zenek', 'Żaneta',
    ]);
  });

  it('keeps the server order for ties in both directions', () => {
    const tied = ['Adam', 'Łukasz'];
    const byGames = (ascending: boolean) =>
      names(sortPlayers(players, { key: 'games', ascending })).filter((n) => tied.includes(n));
    expect(byGames(false)).toEqual(tied);
    expect(byGames(true)).toEqual(tied);
  });

  it('does not change the input array', () => {
    const before = names(players);
    sortPlayers(players, { key: 'name', ascending: true });
    expect(names(players)).toEqual(before);
  });
});

describe('nextPlayerSort', () => {
  it('starts a numeric column from the highest value', () => {
    expect(nextPlayerSort(DEFAULT_PLAYER_SORT, 'wins')).toEqual({ key: 'wins', ascending: false });
  });

  it('starts the name column from A', () => {
    expect(nextPlayerSort(DEFAULT_PLAYER_SORT, 'name')).toEqual({ key: 'name', ascending: true });
  });

  it('reverses the direction on the active column', () => {
    expect(nextPlayerSort(DEFAULT_PLAYER_SORT, 'winRatio')).toEqual({ key: 'winRatio', ascending: true });
  });
});
