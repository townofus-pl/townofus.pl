import type { Metadata } from "next";
import { getGamesListByDate } from "../../../_services";
import { formatDisplayDate } from "@/app/dramaafera/_utils/gameUtils";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { GameDetailContent } from "./GameDetailContent";

interface GamePageProps {
    params: Promise<{ date: string; gameId: string}> ;
}

export async function generateStaticParams() {
    // Return empty array during build time as Cloudflare context is not available
    // This will be populated at runtime
    return [];
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
    const { date, gameId } = await params;
    const formattedDate = formatDisplayDate(date);
    
    // Uses CURRENT_SEASON explicitly. Phase 8 sezon wrappers will provide
    // seasonId from URL params and can override metadata at that point.
    const games = await getGamesListByDate(date, CURRENT_SEASON);
    const gameIndex = games.findIndex(g => g.id.toString() === gameId);
    // Numeracja od najstarszej (1) do najmłodszej (games.length)
    const gameNumber = gameIndex !== -1 ? games.length - gameIndex : gameId;
    
    return {
        title: `Drama Afera - Gra #${gameNumber} - ${formattedDate}`
    };
}

export default async function GamePage({ params }: GamePageProps) {
    const { date, gameId } = await params;
    return <GameDetailContent date={date} gameId={gameId} seasonId={CURRENT_SEASON} />;
}
