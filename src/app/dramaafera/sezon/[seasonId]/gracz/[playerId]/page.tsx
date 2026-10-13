import { notFound } from 'next/navigation';
import { UserProfileContent } from '@/app/dramaafera/user/[nick]/UserProfileContent';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
export default async function Page({
    params,
}: {
    params: Promise<{ playerId: string; seasonId: string }>;
}) {
    const { playerId, seasonId } = await params;
    const id = Number(playerId);
    if (!/^\d+$/.test(playerId) || !Number.isSafeInteger(id) || id <= 0) notFound();
    return <UserProfileContent playerId={id} seasonId={parseAndValidateSeasonId(seasonId)} />;
}
