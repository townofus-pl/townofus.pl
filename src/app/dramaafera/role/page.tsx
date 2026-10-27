import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import RoleRankingContent from './RoleRankingContent';

export default function RolePage() {
    return <RoleRankingContent seasonId={CURRENT_SEASON} />;
}
