import Image from 'next/image';
import { UIGameData } from '@/app/dramaafera/_services/games/types';
import { videotext, formatDate } from './constants';
import { getRoleIconPath } from '@/app/dramaafera/_utils/gameUtils';

interface PlayerHistoryProps {
    nickname: string;
    isFullscreen: boolean;
    topPlayerGames: UIGameData[];
    playerRankingChanges: Record<string, number>;
    date: string;
}

export default function PlayerHistory({ nickname, isFullscreen, topPlayerGames, playerRankingChanges, date }: PlayerHistoryProps) {
    if (topPlayerGames.length === 0) return null;

    // Filtruj tylko gry tego gracza
    const playerGamesDetails = topPlayerGames.map(game => {
        const playerData = game.detailedStats.playersData.find(p => p.nickname === nickname);
        return {
            game,
            playerData,
            played: !!playerData
        };
    });

    // Rozmiar kwadratów
    const squareSize = isFullscreen ? 160 : 80;
    const gap = isFullscreen ? 16 : 12;

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center px-8 z-50"
            style={{
                opacity: 1
            }}
        >
            {/* Tytuł - nick gracza */}
            <h1
                className={`${videotext.className} font-bold text-amber-400 mb-4 ${isFullscreen ? 'text-8xl' : 'text-6xl'}`}
                style={{
                    textShadow: '0 0 40px rgba(251, 191, 36, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em'
                }}
            >
                {nickname}
            </h1>

            {/* Podtytuł - data */}
            <p className={`${videotext.className} text-amber-200 mb-12 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`} style={{ letterSpacing: '-0.02em' }}>
                RUNDY Z {formatDate(date)}
            </p>

            {/* Grid z grami - dzielone na rzędy po 10 */}
            <div className="flex flex-col items-center" style={{ gap: `${gap}px` }}>
                {Array.from({ length: Math.ceil(playerGamesDetails.length / 10) }).map((_, rowIndex) => {
                    const startIdx = rowIndex * 10;
                    const endIdx = Math.min(startIdx + 10, playerGamesDetails.length);
                    const rowGames = playerGamesDetails.slice(startIdx, endIdx);

                    return (
                        <div
                            key={rowIndex}
                            className="flex justify-center"
                            style={{ gap: `${gap}px` }}
                        >
                            {rowGames.map((gameDetail, index) => {
                                const { playerData, played, game } = gameDetail;
                                const won = playerData?.win || false;
                                const disconnected = !!playerData?.originalStats?.disconnected;
                                const actualIndex = startIdx + index;

                                // Pobierz zmianę punktów rankingowych dla tej gry
                                const rankingChange = playerRankingChanges[game.id];

                                return (
                                    <div key={actualIndex} className="flex flex-col items-center">
                                {/* Zmiana punktów rankingowych NAD kwadratem */}
                                {rankingChange !== undefined && (
                                    <div
                                        className={`${videotext.className} font-bold mb-1 ${isFullscreen ? 'text-xl' : 'text-base'}`}
                                        style={{
                                            color: rankingChange === 0
                                                ? 'rgb(156, 163, 175)' // Szary dla 0
                                                : rankingChange > 0
                                                    ? 'rgb(34, 197, 94)' // Zielony dla dodatnich
                                                    : 'rgb(239, 68, 68)', // Czerwony dla ujemnych
                                            textShadow: '0 0 10px rgba(0, 0, 0, 0.8)'
                                        }}
                                    >
                                        {rankingChange >= 0 ? '+' : ''}{Math.round(rankingChange)}
                                    </div>
                                )}

                                {/* Kwadrat z grą */}
                                <div
                                    className="relative"
                                    style={{
                                        width: `${squareSize}px`,
                                        height: `${squareSize}px`,
                                        border: played
                                            ? (won ? '4px solid rgba(245, 216, 122, 1)' : '4px solid rgb(162, 17, 17)')
                                            : '4px solid rgb(61, 61, 61)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        boxShadow: played
                                            ? (won
                                                ? 'inset 0 0 30px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                                : 'inset 0 0 30px rgba(105, 13, 13, 0.5), inset 0 0 25px rgba(182, 41, 41, 0.3)')
                                            : 'inset 0 0 30px rgba(61, 61, 61   , 0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {played && playerData && (
                                        <Image
                                            src={getRoleIconPath(playerData.role)}
                                            alt={playerData.role}
                                            width={squareSize}
                                            height={squareSize}
                                            className={`object-contain scale-[1.3] ${disconnected ? 'pixelated' : ''}`}
                                            style={{
                                                position: 'relative',
                                                zIndex: 10,
                                                filter: disconnected ? 'grayscale(100%)' : 'none'
                                            }}
                                        />
                                    )}

                                    {/* D/C overlay dla disconnect */}
                                    {disconnected && (
                                        <div
                                            className={`${videotext.className} font-bold absolute`}
                                            style={{
                                                bottom: isFullscreen ? '8px' : '4px',
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                textShadow: '0 0 10px rgba(0, 0, 0, 1)',
                                                fontSize: isFullscreen ? '32px' : '16px',
                                                zIndex: 20,
                                                letterSpacing: '0.1em'
                                            }}
                                        >
                                            D/C
                                        </div>
                                    )}
                                </div>

                                {/* Statystyki pod kwadratem */}
                                {played && playerData && (
                                    <div className={`text-center mt-2 ${isFullscreen ? 'text-sm' : 'text-xs'} leading-tight`}>
                                        {/* Kills */}
                                        {playerData.originalStats.correctKills > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctKills} CORRECT KILL{playerData.originalStats.correctKills > 1 ? 'A' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectKills > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectKills} INCORRECT KILL{playerData.originalStats.incorrectKills > 1 ? 'A' : ''}</div>
                                        )}

                                        {/* Guesses */}
                                        {playerData.originalStats.correctGuesses > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctGuesses} CORRECT GUESS{playerData.originalStats.correctGuesses > 1 ? 'A' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectGuesses > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectGuesses} INCORRECT GUESS{playerData.originalStats.incorrectGuesses > 1 ? 'A' : ''}</div>
                                        )}

                                        {/* Medic Shields */}
                                        {playerData.originalStats.correctMedicShields > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctMedicShields} CORRECT SHIELD{playerData.originalStats.correctMedicShields > 1 ? 'E' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectMedicShields > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectMedicShields} INCORRECT SHIELD{playerData.originalStats.incorrectMedicShields > 1 ? 'E' : ''}</div>
                                        )}

                                        {/* Warden Fortifies */}
                                        {playerData.originalStats.correctWardenFortifies > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctWardenFortifies} CORRECT FORTIFY{playerData.originalStats.correctWardenFortifies > 1 ? 'A' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectWardenFortifies > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectWardenFortifies} INCORRECT FORTIFY{playerData.originalStats.incorrectWardenFortifies > 1 ? 'A' : ''}</div>
                                        )}

                                        {/* Jailor Executes */}
                                        {playerData.originalStats.correctJailorExecutes > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctJailorExecutes} CORRECT EXECUTE{playerData.originalStats.correctJailorExecutes > 1 ? 'E' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectJailorExecutes > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectJailorExecutes} INCORRECT EXECUTE{playerData.originalStats.incorrectJailorExecutes > 1 ? 'E' : ''}</div>
                                        )}

                                        {/* Prosecutor Prosecutes */}
                                        {playerData.originalStats.correctProsecutes > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctProsecutes} CORRECT PROSECUTE{playerData.originalStats.correctProsecutes > 1 ? 'A' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectProsecutes > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectProsecutes} INCORRECT PROSECUTE{playerData.originalStats.incorrectProsecutes > 1 ? 'A' : ''}</div>
                                        )}

                                        {/* Deputy Shoots */}
                                        {playerData.originalStats.correctDeputyShoots > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctDeputyShoots} CORRECT SHOT{playerData.originalStats.correctDeputyShoots > 1 ? 'Y' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectDeputyShoots > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectDeputyShoots} INCORRECT SHOT{playerData.originalStats.incorrectDeputyShoots > 1 ? 'Y' : ''}</div>
                                        )}

                                        {/* Altruist Revives */}
                                        {playerData.originalStats.correctAltruistRevives > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctAltruistRevives} CORRECT REVIVE{playerData.originalStats.correctAltruistRevives > 1 ? 'A' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectAltruistRevives > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectAltruistRevives} INCORRECT REVIVE{playerData.originalStats.incorrectAltruistRevives > 1 ? 'A' : ''}</div>
                                        )}

                                        {/* Swaps */}
                                        {playerData.originalStats.correctSwaps > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctSwaps} CORRECT SWAP{playerData.originalStats.correctSwaps > 1 ? 'Y' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectSwaps > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectSwaps} INCORRECT SWAP{playerData.originalStats.incorrectSwaps > 1 ? 'Y' : ''}</div>
                                        )}

                                        {/* Janitor Cleans */}
                                        {playerData.originalStats.janitorCleans > 0 && (
                                            <div className="text-gray-400">{playerData.originalStats.janitorCleans} CLEAN{playerData.originalStats.janitorCleans > 1 ? 'A' : ''}</div>
                                        )}
                                    </div>
                                )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
