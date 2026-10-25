import type { Metadata } from 'next';
import { getRanking, getLatestEmperorId } from '@/app/dramaafera/_services';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import RankingClient from '@/app/dramaafera/_components/RankingClient';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);
    return {
        alternates: {
            canonical: buildSeasonUrl('/ranking', seasonId),
        },
    };
}

export default async function SeasonRankingPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    const [{ ranking }, latestEmperorId] = await Promise.all([
        getRanking(seasonId),
        getLatestEmperorId(seasonId),
    ]);
    return <RankingClient initialData={ranking} initialEmperorId={latestEmperorId} seasonId={seasonId} />;
}
