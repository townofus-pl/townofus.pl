import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import InnePage from '../../../role/page';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export default async function SeasonRolePage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    parseAndValidateSeasonId(seasonIdStr);

    // TODO: Pass seasonId to InnePage once it supports season-scoped role listing
    // (Phase 7+ — InnePage currently shows all roles regardless of season)
    return <InnePage />;
}
