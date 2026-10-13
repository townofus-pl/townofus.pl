import Link from "next/link";
import Image from "next/image";
import { getGameData } from "../../../_services";
import { formatDisplayDate, getPlayerAvatarPath } from "@/app/dramaafera/_utils/gameUtils";
import { buildSeasonUrl } from "@/app/dramaafera/_utils/seasonHelpers";
import { TeamColors } from "@/constants/teams";
import { notFound } from "next/navigation";
import { PlayerStatsSection } from "./PlayerStatsSection";
import { GameTimeline } from "./GameTimeline";
import { MeetingsSection } from "./MeetingsSection";

interface GameDetailContentProps {
    date: string;
    gameId: string;
    seasonId: number;
}

export async function GameDetailContent({ date, gameId, seasonId }: GameDetailContentProps) {
    const gameData = await getGameData(gameId);

    if (!gameData) {
        notFound();
    }

    const displayDate = formatDisplayDate(date);

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link 
                        href={buildSeasonUrl(`/historia-gier/${date}`, seasonId)}
                        className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block"
                    >
                        ← Powrót do {displayDate}
                    </Link>
                    <h1 className="text-5xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Gra #{gameData.id}
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        {gameData.date} • {gameData.duration} • {gameData.map}
                    </p>
                </div>

                {/* Podstawowe informacje */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`rounded-lg p-6 border text-center`}
                         style={{
                             backgroundColor: gameData.winnerColor ? `${gameData.winnerColor}20` : 
                                 gameData.winner === 'Crewmate' ? `${TeamColors.Crewmate}20` :
                                 gameData.winner === 'Impostor' ? `${TeamColors.Impostor}20` : `${TeamColors.Neutral}20`,
                             borderColor: gameData.winnerColor ? `${gameData.winnerColor}50` :
                                 gameData.winner === 'Crewmate' ? `${TeamColors.Crewmate}50` :
                                 gameData.winner === 'Impostor' ? `${TeamColors.Impostor}50` : `${TeamColors.Neutral}50`
                         }}>
                        <h3 className="text-2xl font-bold mb-2">🏆 Zwycięzca</h3>
                        <p className="text-xl font-semibold"
                           style={{
                               color: gameData.winnerColor || (
                                   gameData.winner === 'Crewmate' ? TeamColors.Crewmate :
                                   gameData.winner === 'Impostor' ? TeamColors.Impostor : TeamColors.Neutral
                               )
                           }}>
                            {gameData.winner}
                        </p>
                        <p className="text-gray-300 mt-2">{gameData.winCondition}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 text-center">
                        <h3 className="text-2xl font-bold mb-2">👥 Gracze</h3>
                        <p className="text-xl font-semibold text-blue-300">{gameData.players}</p>
                        <p className="text-gray-300 mt-2">Uczestników</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 text-center">
                        <h3 className="text-2xl font-bold mb-2">⏱️ Czas gry</h3>
                        <p className="text-xl font-semibold text-green-300">{gameData.duration}</p>
                        <p className="text-gray-300 mt-2">Długość rozgrywki</p>
                    </div>
                </div>

                {/* Zwycięzcy */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4 text-center">🎉 Zwycięzcy</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {gameData.winnerNames.map((nickname, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg border"
                                style={{
                                    backgroundColor: gameData.winnerColors[nickname] ? `${gameData.winnerColors[nickname]}30` :
                                        gameData.winner === 'Crewmate' ? `${TeamColors.Crewmate}30` :
                                        gameData.winner === 'Impostor' ? `${TeamColors.Impostor}30` : `${TeamColors.Neutral}30`,
                                    borderColor: gameData.winnerColors[nickname] ? `${gameData.winnerColors[nickname]}70` :
                                        gameData.winner === 'Crewmate' ? `${TeamColors.Crewmate}70` :
                                        gameData.winner === 'Impostor' ? `${TeamColors.Impostor}70` : `${TeamColors.Neutral}70`
                                }}
                            >
                                <Image
                                    src={getPlayerAvatarPath(nickname)}
                                    alt={`Avatar ${nickname}`}
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2"
                                    style={{
                                        borderColor: gameData.winnerColors[nickname] ? gameData.winnerColors[nickname] :
                                            gameData.winner === 'Crewmate' ? TeamColors.Crewmate :
                                            gameData.winner === 'Impostor' ? TeamColors.Impostor : TeamColors.Neutral
                                    }}
                                />
                                <span 
                                    className="text-lg font-semibold"
                                    style={{
                                        color: gameData.winnerColors[nickname] ? gameData.winnerColors[nickname] :
                                            gameData.winner === 'Crewmate' ? TeamColors.Crewmate :
                                            gameData.winner === 'Impostor' ? TeamColors.Impostor : TeamColors.Neutral
                                    }}
                                >
                                    {nickname}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statystyki graczy */}
                <PlayerStatsSection 
                    playersData={gameData.detailedStats.playersData} 
                    maxTasks={gameData.maxTasks || 0}
                    seasonId={seasonId}
                />

                <GameTimeline events={gameData.detailedStats.events} endTimestamp={gameData.detailedStats.endTimestamp} />

                <MeetingsSection meetings={gameData.detailedStats.meetings} playersData={gameData.detailedStats.playersData} seasonId={seasonId} />

                <div className="text-center">
                    <Link 
                        href={buildSeasonUrl(`/historia-gier/${date}`, seasonId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold inline-block"
                    >
                        ← Powrót do {displayDate}
                    </Link>
                </div>
            </div>
        </div>
    );
}
