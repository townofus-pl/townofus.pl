import { getRanking, getLatestEmperorId } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import RankingClient from "@/app/dramaafera/_components/RankingClient";

export default async function RankingPage() {
    const seasonId = CURRENT_SEASON;
    const [{ ranking }, latestEmperorId] = await Promise.all([
        getRanking(seasonId),
        getLatestEmperorId(seasonId),
    ]);

    return <RankingClient initialData={ranking} initialEmperorId={latestEmperorId} seasonId={seasonId} />;
}
