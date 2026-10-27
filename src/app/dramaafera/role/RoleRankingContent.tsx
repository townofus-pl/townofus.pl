import { generateRoleRankingSummary } from '@/app/dramaafera/_services';
import RoleRankingTable from '@/app/dramaafera/_components/RoleRankingTable';

export default async function RoleRankingContent({ seasonId }: { seasonId: number }) {
    const roles = await generateRoleRankingSummary(seasonId);
    return <RoleRankingTable key={seasonId} roles={roles} seasonId={seasonId} />;
}
