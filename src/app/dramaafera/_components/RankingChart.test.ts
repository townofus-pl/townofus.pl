import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RankingChart } from './RankingChart';

test('pads the visible rating range by 50 on both ends and keeps clipped rank labels in the expanded chart', () => {
  const markup = renderToStaticMarkup(createElement(RankingChart, {
    data: [{ date: new Date('2026-10-10'), score: 2000 }],
    comparison: { playerName: 'Drugi gracz', data: [{ date: new Date('2026-10-10'), score: 1600 }] },
    includeStartingPoint: false,
    expanded: true,
    seasonId: 4,
  }));
  const scaleY = (score: number) => 1680 - ((score - 1550) / (2050 - 1550)) * 1680;
  expect(markup).toContain(`cy="${scaleY(1600)}"`);
  expect(markup).toContain(`cy="${scaleY(2000)}"`);
  expect(markup).toContain(`y="${scaleY((2025 + 2050) / 2) + 8}"`);
  expect(markup).toContain('>CAPTAIN</text>');
  expect(markup).toContain(`y="${scaleY((1550 + 1767) / 2) + 8}"`);
  expect(markup).toContain('>BAROX</text>');
  expect(markup).toContain('>CWEL</text>');
  expect(markup).toContain('>1767</text>');
  expect(markup).not.toContain('>0</text>');
});

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
  expect(markup).toContain('d="M 140 65 L 280 21.666666666666657"');
  expect(markup).toContain('stroke="rgb(34, 211, 238)"');
  expect(markup.match(/<image /g)).toHaveLength(2);
  expect(markup).toContain('>Malkiz (2200)</text>');
  expect(markup).toContain('>Drugi gracz (2200)</text>');
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
  expect(markup).toContain('d="M 0 108.33333333333334 L 140 65 L 280 21.666666666666657"');
  expect(markup).toContain('d="M 140 65 L 280 21.666666666666657"');
  expect(markup.match(/>10\.10<\/text>/g)).toHaveLength(1);
});

test('renders a single ranking point without invalid coordinates', () => {
  const markup = renderToStaticMarkup(createElement(RankingChart, {
    data: [{ date: new Date('2026-10-10'), score: 2000 }],
    includeStartingPoint: false,
    seasonId: 4,
  }));
  expect(markup).toContain('x1="0" y1="0" x2="280" y2="0"');
  expect(markup).toContain('x1="0" y1="130" x2="280" y2="130"');
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
  expect(markup).toContain('>Gracz A (2000)</text>');
  expect(markup).toContain('>Gracz B (2000)</text>');
  expect(markup).toContain('stroke="rgb(34, 211, 238)"');
  expect(markup).toContain('stroke="#F472B6"');
});
