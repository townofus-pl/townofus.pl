import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RankingChart } from './RankingChart';

test('aligns comparison on the shared timeline when players have different numbers of ranking entries', () => {
  const markup = renderToStaticMarkup(createElement(RankingChart, {
    playerName: 'Malkiz',
    data: [
      { date: new Date('2026-10-10T12:00:00Z'), score: 2000 },
      { date: new Date('2026-10-12T12:00:00Z'), score: 2200 },
    ],
    comparison: {
      playerName: 'Drugi gracz',
      data: [
        { date: new Date('2026-10-11T12:00:00Z'), score: 2100 },
        { date: new Date('2026-10-12T12:00:00Z'), score: 2200 },
      ],
    },
    includeStartingPoint: false,
    seasonId: 4,
  }));
  expect(markup).toContain('d="M 140 65 L 280 0"');
  expect(markup).toContain('stroke="rgb(34, 211, 238)"');
  expect(markup.match(/<image /g)).toHaveLength(2);
  expect(markup).toContain('>Malkiz</text>');
  expect(markup).toContain('>Drugi gracz</text>');
});

test('spaces games evenly across weekly sessions and aligns both players on the same game', () => {
  const data = [
    { date: new Date('2026-10-10T12:00:00Z'), gameId: 1, score: 2000 },
    { date: new Date('2026-10-10T12:10:00Z'), gameId: 2, score: 2100 },
    { date: new Date('2026-10-17T12:00:00Z'), gameId: 3, score: 2200 },
  ];
  const markup = renderToStaticMarkup(createElement(RankingChart, {
    data,
    comparison: { playerName: 'Drugi gracz', data: data.slice(1) },
    includeStartingPoint: false,
    seasonId: 4,
  }));
  expect(markup).toContain('d="M 0 130 L 140 65 L 280 0"');
  expect(markup).toContain('d="M 140 65 L 280 0"');
  expect(markup.match(/>10\.10<\/text>/g)).toHaveLength(1);
});

test('renders a single ranking point without invalid coordinates', () => {
  const markup = renderToStaticMarkup(createElement(RankingChart, {
    data: [{ date: new Date('2026-10-10'), score: 2000 }],
    includeStartingPoint: false,
    seasonId: 4,
  }));
  expect(markup).not.toContain('NaN');
  expect(markup).not.toContain('Infinity');
});

test('supports several selected players with separate lines, avatars and colours', () => {
  const data = [{ date: new Date('2026-10-10'), score: 2000 }];
  const markup = renderToStaticMarkup(createElement(RankingChart, {
    playerName: 'Malkiz', data, includeStartingPoint: false, seasonId: 4,
    comparison: [
      { playerName: 'Gracz A', data },
      { playerName: 'Gracz B', data },
    ],
  }));
  expect(markup.match(/<image /g)).toHaveLength(3);
  expect(markup).toContain('>Gracz A</text>');
  expect(markup).toContain('>Gracz B</text>');
  expect(markup).toContain('stroke="rgb(34, 211, 238)"');
  expect(markup).toContain('stroke="#F472B6"');
});
