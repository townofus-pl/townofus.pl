import { getGameDatesLightweight, getSessionSummaryByDate } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import WynikiClient from "@/app/dramaafera/_components/WynikiClient";
import { getListaCweliForDisplay } from "@/app/dramaafera/_services/gameSessionList";

export default async function WynikiPage() {
    const seasonId = CURRENT_SEASON;
    const { dates } = await getGameDatesLightweight(false, seasonId);

    const listaCweli = await getListaCweliForDisplay(seasonId);

    // Pobierz wyniki dla najnowszej daty (jeśli dostępna)
    const latestDate = dates.length > 0 ? dates[0].date : null;
    const initialResults = latestDate
        ? await getSessionSummaryByDate(latestDate, seasonId)
        : null;

    return (
        <WynikiClient
            initialDates={dates}
            initialResults={initialResults}
            seasonId={seasonId}
            listaCweli={listaCweli}
        />
    );
}
