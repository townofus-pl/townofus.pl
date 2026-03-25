import { getGameDatesLightweight } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import HostClient from "@/app/dramaafera/_components/HostClient";

export default async function HostPage() {
    const seasonId = CURRENT_SEASON;
    const { dates } = await getGameDatesLightweight(false, seasonId);

    return <HostClient initialDates={dates} seasonId={seasonId} />;
}
