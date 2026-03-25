import { getRanking } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import RankingClient from "@/app/dramaafera/_components/RankingClient";

export default async function RankingPage() {
    const seasonId = CURRENT_SEASON;
    const { ranking } = await getRanking(seasonId);

    return <RankingClient initialData={ranking} seasonId={seasonId} />;
}
