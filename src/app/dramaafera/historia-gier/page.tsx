import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { HistoriaGierContent } from "./HistoriaGierContent";

export default async function HistoriaGierPage() {
    return <HistoriaGierContent seasonId={CURRENT_SEASON} />;
}
