// Case- and diacritic-insensitive matching for player name search and typo detection.

const NON_DECOMPOSING_DIACRITICS: Record<string, string> = { ł: 'l', Ł: 'l' };
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function foldText(text: string): string {
  return text
    .split('')
    .map((char) => NON_DECOMPOSING_DIACRITICS[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase();
}

export function matchesSearch(haystack: string, query: string): boolean {
  const foldedQuery = foldText(query.trim());
  if (!foldedQuery) return true;
  return foldText(haystack).includes(foldedQuery);
}

export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[rows - 1][cols - 1];
}

/**
 * Returns the existing name that a brand-new candidate name likely collides
 * with (exact match after folding, or Levenshtein distance <= 1 on the
 * folded forms), or null if the candidate looks genuinely distinct.
 */
export function findSimilarPlayerName(candidate: string, existingNames: string[]): string | null {
  const foldedCandidate = foldText(candidate);
  for (const existing of existingNames) {
    const foldedExisting = foldText(existing);
    if (foldedCandidate === foldedExisting || levenshteinDistance(foldedCandidate, foldedExisting) <= 1) {
      return existing;
    }
  }
  return null;
}
