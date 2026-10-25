import type { Metadata } from 'next';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import RoleRankingContent from '@/app/dramaafera/role/RoleRankingContent';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId } = await params;
    return { alternates: { canonical: buildSeasonUrl('/role', parseAndValidateSeasonId(seasonId)) } };
}

export default async function SeasonRolePage({ params }: PageProps) {
    const { seasonId } = await params;
    return <RoleRankingContent seasonId={parseAndValidateSeasonId(seasonId)} />;
}
