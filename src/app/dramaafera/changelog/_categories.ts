export const REVIEW_CATEGORIES = ['emperor_decree', 'buff', 'nerf', 'adjustment'] as const;
export type ReviewCategory = typeof REVIEW_CATEGORIES[number];
export type ChangelogCategories = Record<string, ReviewCategory>;
