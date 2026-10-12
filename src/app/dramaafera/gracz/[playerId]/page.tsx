import { notFound } from 'next/navigation';
import { CURRENT_SEASON } from '../../_constants/seasons';
import { UserProfileContent } from '../../user/[nick]/UserProfileContent';
export default async function Page({ params }: { params: Promise<{ playerId: string }> }) {
    const { playerId } = await params;
    const id = Number(playerId);
    if (!/^\d+$/.test(playerId) || !Number.isSafeInteger(id) || id <= 0) notFound();
    return <UserProfileContent playerId={id} seasonId={CURRENT_SEASON} />;
}
