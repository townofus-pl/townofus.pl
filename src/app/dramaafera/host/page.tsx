import { getGameDatesLightweight, generateRoleRankingStats } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { AVAILABLE_AVATARS } from "@/app/dramaafera/_constants/avatars";
import HostTabs from "@/app/dramaafera/_components/HostTabs";

export default async function HostPage() {
    const seasonId = CURRENT_SEASON;
    const { dates } = await getGameDatesLightweight(false, seasonId);
    const roles = await generateRoleRankingStats(seasonId);

    return <HostTabs initialDates={dates} seasonId={seasonId} roles={roles} availableAvatars={AVAILABLE_AVATARS} />;
}
