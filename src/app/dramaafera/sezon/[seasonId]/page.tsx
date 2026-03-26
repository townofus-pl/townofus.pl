import { redirect } from 'next/navigation';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export default async function SeasonRootPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    redirect(buildSeasonUrl('/ranking', seasonId));
}
