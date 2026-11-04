import { getGameDatesLightweight, generateRoleRankingStats } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import HostTabs from "@/app/dramaafera/_components/HostTabs";
import { getRoleProbabilities } from "@/app/dramaafera/_services/rankings/getRoleProbabilities";

export default async function HostPage() {
    const seasonId = CURRENT_SEASON;
    const [{ dates }, roles, probabilities] = await Promise.all([
        getGameDatesLightweight(false, seasonId),
        generateRoleRankingStats(seasonId),
        getRoleProbabilities(seasonId),
    ]);

    return <HostTabs initialDates={dates} seasonId={seasonId} roles={roles} probabilities={probabilities} />;
}
