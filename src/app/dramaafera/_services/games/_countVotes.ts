/**
 * Correct and incorrect votes per voter name, each decision counted with its weight. A revealed
 * Mayor's one decision is three votes, and the league wants all three shown. `weight` is in
 * `detail` since mod 12f6eea; an older action has none, which means 1.
 */
export function countVotes(
  actions: ReadonlyArray<{ isCorrect: boolean | null; detail: string | null; performer: { name: string } }>,
): Map<string, { correct: number; incorrect: number }> {
  const out = new Map<string, { correct: number; incorrect: number }>();
  for (const a of actions) {
    if (a.isCorrect === null) continue;
    let weight = 1;
    if (a.detail) {
      try {
        const w = (JSON.parse(a.detail) as { weight?: unknown }).weight;
        if (typeof w === 'number' && Number.isInteger(w) && w >= 1) weight = w;
      } catch {
        // A malformed detail is not worth losing the vote over.
      }
    }
    const row = out.get(a.performer.name) ?? { correct: 0, incorrect: 0 };
    if (a.isCorrect) row.correct += weight;
    else row.incorrect += weight;
    out.set(a.performer.name, row);
  }
  return out;
}
