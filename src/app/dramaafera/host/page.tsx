import {requireHost} from '@/app/dramaafera/_accounts/requireHost';
import { getGameDatesLightweight, generateRoleRankingStats } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import HostTabs from "@/app/dramaafera/_components/HostTabs";

export default async function HostPage() {
    await requireHost();
    const seasonId = CURRENT_SEASON;
    const { dates } = await getGameDatesLightweight(false, seasonId);
    const roles = await generateRoleRankingStats(seasonId);

    return <HostTabs initialDates={dates} seasonId={seasonId} roles={roles} />;
}
