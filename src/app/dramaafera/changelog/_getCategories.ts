import 'server-only';

import { getDatabaseClient } from '../_services/db';
import { REVIEW_CATEGORIES, type ReviewCategory } from './_categories';
import { parseSections, settingId } from './_miraConfigSections';

interface PublishedSettings { content: string; uploadedAt: Date }
interface ReviewedSetting { section: string; key: string; after: string; decision: string; roleName: string }
export interface CategorizedChangelogChange { id: string; roleName: string; category: ReviewCategory }

function settingValues(content: string): Map<string, string> {
    return new Map(parseSections(content).flatMap(section =>
        section.entries.map(entry => [settingId(section.name, entry.key), entry.value] as const)
    ));
}

export async function getCategorizedChangelogChanges(current: PublishedSettings, old: PublishedSettings): Promise<CategorizedChangelogChange[]> {
    const prisma = await getDatabaseClient();
    if (!prisma) return [];

    const reviews = await prisma.$queryRaw<ReviewedSetting[]>`
        SELECT json_extract(setting.value, '$.section') AS section,
               json_extract(setting.value, '$.key') AS key,
               json_extract(setting.value, '$.after') AS after,
               review.decision, review.roleName
        FROM role_balance_reviews review
        JOIN json_each(review.snapshot, '$.settingsChanges') setting
        WHERE review.deletedAt IS NULL
          AND julianday(review.createdAt) BETWEEN julianday(${old.uploadedAt.toISOString()}) AND julianday(${current.uploadedAt.toISOString()})
        ORDER BY review.id DESC
    `;
    const currentValues = settingValues(current.content);
    const oldValues = settingValues(old.content);
    const seen = new Set<string>();
    const changes: CategorizedChangelogChange[] = [];

    for (const review of reviews) {
        const id = settingId(review.section, review.key);
        if (seen.has(id)) continue;
        seen.add(id);
        const category = REVIEW_CATEGORIES.find(value => value === review.decision);
        if (category && oldValues.has(id) && oldValues.get(id) !== review.after && currentValues.get(id) === review.after) {
            changes.push({ id, roleName: review.roleName, category });
        }
    }

    return changes;
}
