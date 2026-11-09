'use server';

import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { getDramaAferaSettingsPair } from '../_services/settings/getDramaAferaSettings';
import { pickMiraPair } from '../_utils/miraConfig';
import { getCategorizedChangelogChanges } from '../changelog/_getCategories';
import { formatDiscordChangelog } from '../host/_utils/formatDiscordChangelog';
import { CURRENT_SEASON, getSeasonById } from '../_constants/seasons';
import { getGameDatesLightweight, getRanking, getRankingAfterSession, getWeeklyStats } from '../_services/season';

async function authorizeDiscordMaterials() {
    const auth = await authenticateHeaders(await headers());
    if (!auth.success) throw new Error('Brak autoryzacji.');
}

export async function getDiscordChangelogAction(): Promise<string> {
    await authorizeDiscordMaterials();
    const { current, old } = await getDramaAferaSettingsPair();
    const changes = current && old && pickMiraPair(current.content, old.content)
        ? await getCategorizedChangelogChanges(current, old)
        : [];
    return formatDiscordChangelog(changes, new Date());
}

function formatRankingTitle(sessionDate: string): string {
    const isoDate = sessionDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
    const seasonStart = new Date(getSeasonById(CURRENT_SEASON)?.startDate ?? isoDate);
    // Weekly presentation stats also start on Monday.
    seasonStart.setUTCDate(seasonStart.getUTCDate() - (seasonStart.getUTCDay() + 6) % 7);
    const week = Math.floor((Date.parse(isoDate) - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    const date = isoDate.split('-').reverse().join('.');
    return `AMONG US RANKING AFERA po ${date} [SEASON ${CURRENT_SEASON} WEEK ${week}]`;
}

export async function getDiscordRankingAction() {
    await authorizeDiscordMaterials();
    const [{ dates }, { ranking }] = await Promise.all([
        getGameDatesLightweight(false, CURRENT_SEASON),
        getRanking(CURRENT_SEASON, -1),
    ]);
    const [latest, previous] = dates;
    const [previousRanking, weeklyStats] = await Promise.all([
        previous ? getRankingAfterSession(previous.date, CURRENT_SEASON) : null,
        latest ? getWeeklyStats(latest.date, CURRENT_SEASON) : null,
    ]);
    const previousRatings = new Map(previousRanking?.map(player => [player.nickname, player.rating]));
    return {
        title: latest ? formatRankingTitle(latest.date) : 'AMONG US RANKING AFERA',
        ranking: ranking.map(player => {
            const rating = player.currentRating;
            return {
                nickname: player.playerName,
                rating,
                position: player.rank,
                ratingChange: rating - (previousRatings.get(player.playerName) ?? rating),
            };
        }),
        weeklyStats: weeklyStats?.players.map(({ nickname, totalPoints }) => ({ nickname, totalPoints })) ?? [],
        baselineDate: previousRanking ? previous?.displayDate : undefined,
    };
}
