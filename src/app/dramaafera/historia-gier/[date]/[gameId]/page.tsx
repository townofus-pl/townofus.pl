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
    
    // Pobierz listę gier tego dnia, żeby znaleźć numer gry
    const games = await getGamesListByDate(date);
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
