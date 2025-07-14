import Link from "next/link";
import Image from "next/image";
import { getGameData, getGameDatesList, formatDisplayDate } from "@/data/games";
import { formatPlayerStatsWithColors, getRoleColor } from "@/data/games/converter";
import { TeamColors } from "@/constants/teams";
import { notFound } from "next/navigation";

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    // Każdy gracz ma swój avatar na podstawie nicku
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly


// Funkcja pomocnicza do konwersji nazwy roli na format URL-friendly
function convertRoleToUrlSlug(role: string): string {
    return role.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
}

interface GamePageProps {
    params: Promise<{ date: string; gameId: string}> ;
}

export async function generateStaticParams() {
    const dates = await getGameDatesList();
    const params: { date: string; gameId: string }[] = [];
    
    dates.forEach(dateGroup => {
        dateGroup.games.forEach(game => {
            params.push({
                date: dateGroup.date,
                gameId: game.id
            });
        });
    });
    
    return params;
}

function renderRoleHistory(roleHistory: string[] | undefined) {
    if (!roleHistory || roleHistory.length <= 1) {
        // Jeśli tylko jedna rola lub brak historii, wyświetl normalnie
        const role = roleHistory?.[roleHistory.length - 1] || 'Unknown';
        const roleColor = getRoleColor(role);
        return (
            <Link href={`/dramaafera/role/${convertRoleToUrlSlug(role)}`}>
                <span 
                    className="px-3 py-1 rounded-lg text-base font-semibold hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center h-8"
                    style={{ 
                        backgroundColor: `${roleColor}20`, 
                        color: roleColor,
                        border: `1px solid ${roleColor}40`
                    }}
                >
                    {role}
                </span>
            </Link>
        );
    }

    // Jeśli jest historia ról, wyświetl wszystkie z separatorami - każda rola ze swoim kolorem
    return (
        <div className="flex items-center gap-1">
            {roleHistory.map((role, roleIndex) => {
                const roleColor = getRoleColor(role);
                return (
                    <span key={roleIndex} className="flex items-center">
                        <Link href={`/dramaafera/role/${convertRoleToUrlSlug(role)}`}>
                            <span 
                                className="px-3 py-1 rounded-lg text-base font-semibold hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center h-8"
                                style={{ 
                                    backgroundColor: `${roleColor}20`, 
                                    color: roleColor,
                                    border: `1px solid ${roleColor}40`
                                }}
                            >
                                {role}
                            </span>
                        </Link>
                        {roleIndex < roleHistory.length - 1 && (
                            <span className="mx-2 text-white font-bold text-lg">{'>'}</span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}


export default async function GamePage({ params }: GamePageProps) {
    const {date, gameId} = await params;
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
                        href={`/dramaafera/historia-gier/${date}`}
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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4">📊 Statystyki Graczy</h2>
                    <div className="space-y-4">
                        {gameData.detailedStats.playersData.map((player, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                <div className="flex flex-col space-y-3">
                                    {/* Nazwa gracza */}
                                    <div className="flex items-center space-x-3">
                                        <Image
                                            src={getPlayerAvatarPath(player.nickname)}
                                            alt={`Avatar ${player.nickname}`}
                                            width={48}
                                            height={48}
                                            className="rounded-full border-2"
                                            style={{
                                                borderColor: 
                                                    player.team === 'Crewmate' ? TeamColors.Crewmate :
                                                    player.team === 'Impostor' ? TeamColors.Impostor :
                                                    TeamColors.Neutral
                                            }}
                                        />
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl font-bold text-white">{player.nickname}</span>
                                            <span 
                                                className="text-lg"
                                                style={{
                                                    color: 
                                                        player.team === 'Crewmate' ? TeamColors.Crewmate :
                                                        player.team === 'Impostor' ? TeamColors.Impostor :
                                                        TeamColors.Neutral
                                                }}
                                            >
                                                ({player.team})
                                            </span>
                                            {player.win && (
                                                <span className="text-yellow-400 text-lg">🏆</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Rola i modyfikatory */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {renderRoleHistory(player.roleHistory)}
                                        
                                        {player.modifiers.length > 0 && player.modifiers.map((modifier, modIndex) => (
                                            <span 
                                                key={modIndex}
                                                className="px-3 py-1 rounded-lg text-base font-semibold hover:opacity-80 transition-opacity inline-flex items-center h-8"
                                                style={{
                                                    backgroundColor: `${player.modifierColors[modIndex] || '#6B7280'}30`,
                                                    color: player.modifierColors[modIndex] || '#9CA3AF',
                                                    border: `1px solid ${player.modifierColors[modIndex] || '#6B7280'}40`
                                                }}
                                            >
                                                {modifier}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    {/* Statystyki jako tekst */}
                                    <div className="text-base leading-relaxed flex flex-wrap items-center gap-1">
                                        {formatPlayerStatsWithColors(player, gameData.maxTasks).length > 0 ? (
                                            formatPlayerStatsWithColors(player, gameData.maxTasks).map((stat, statIndex) => (
                                                <span key={statIndex}>
                                                    <span 
                                                        style={{ color: stat.color || '#D1D5DB' }}
                                                        className="font-medium"
                                                    >
                                                        {stat.text}
                                                    </span>
                                                    {statIndex < formatPlayerStatsWithColors(player, gameData.maxTasks).length - 1 && (
                                                        <span className="text-gray-400 mx-1">•</span>
                                                    )}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">No additional statistics</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline wydarzeń */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4">⏰ Przebieg Gry</h2>
                    <div className="space-y-3">
                        {gameData.detailedStats.events.map((event, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 flex items-center space-x-4">
                                <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded font-mono text-sm min-w-16 text-center">
                                    {event.timestamp}
                                </span>
                                <span className={`text-lg ${
                                    event.type === 'kill' ? '🗡️' :
                                    event.type === 'meeting' ? '🔔' :
                                    event.type === 'vote' ? '🗳️' :
                                    event.type === 'task' ? '✅' :
                                    event.type === 'sabotage' ? '💥' :
                                    '🔧'
                                }`}>
                                    {event.type === 'kill' ? '🗡️' :
                                     event.type === 'meeting' ? '🔔' :
                                     event.type === 'vote' ? '🗳️' :
                                     event.type === 'task' ? '✅' :
                                     event.type === 'sabotage' ? '💥' :
                                     '🔧'}
                                </span>
                                <span className="text-gray-300 flex-1">{event.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dane spotkań */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4">🗳️ Spotkania i Głosowania</h2>
                    <div className="space-y-4">
                        {gameData.detailedStats.meetings.map((meeting, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                                <h3 className="text-xl font-bold mb-4 text-blue-400">
                                    Spotkanie #{meeting.meetingNumber}
                                    {meeting.wasTie && <span className="text-yellow-400 ml-2">(Tie)</span>}
                                    {meeting.wasBlessed && <span className="text-purple-400 ml-2">(Blessed)</span>}
                                </h3>
                                
                                {meeting.deathsSinceLastMeeting.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-red-400 mb-2">Zgony od ostatniego spotkania:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {meeting.deathsSinceLastMeeting.map((death, i) => {
                                                // Wyciągnij nick zmarłego (do pierwszego nawiasu)
                                                const deadPlayerName = death.split(' (')[0];
                                                return (
                                                    <div key={i} className="relative group">
                                                        <div className="flex items-center space-x-2 bg-red-600/20 text-red-300 px-2 py-1 rounded border border-red-400/50 cursor-pointer hover:bg-red-600/30 transition-colors">
                                                            <Image
                                                                src={getPlayerAvatarPath(deadPlayerName)}
                                                                alt={`Avatar ${deadPlayerName}`}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full border border-red-400"
                                                            />
                                                            <span>{deadPlayerName}</span>
                                                        </div>
                                                        {/* Tooltip z pełnym opisem */}
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 max-w-xs">
                                                            {death}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-green-400 mb-3">Głosowania:</h4>
                                        <div className="space-y-3">
                                            {Object.entries(meeting.votes).map(([target, voters]) => (
                                                <div key={target} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                                                    {/* Średni avatar i nick osoby otrzymującej głosy */}
                                                    <div className="flex items-center space-x-2">
                                                        <Image
                                                            src={getPlayerAvatarPath(target)}
                                                            alt={`Avatar ${target}`}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full border-2 border-green-400"
                                                        />
                                                        <span className="text-lg font-semibold text-green-300">{target}</span>
                                                    </div>
                                                    
                                                    {/* Strzałka */}
                                                    <span className="text-gray-400">←</span>
                                                    
                                                    {/* Małe avatary głosujących */}
                                                    <div className="flex space-x-1">
                                                        {voters.map((voter, index) => (
                                                            <div key={index} className="relative group">
                                                                <Image
                                                                    src={getPlayerAvatarPath(voter)}
                                                                    alt={`Avatar ${voter}`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full border border-gray-400 hover:border-white transition-colors cursor-pointer"
                                                                />
                                                                {/* Tooltip z nickiem */}
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                                    {voter}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Liczba głosów */}
                                                    <span className="text-sm text-gray-400 ml-auto">
                                                        ({voters.length} głos{voters.length === 1 ? '' : voters.length < 5 ? 'y' : 'ów'})
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            {/* Pominięcia na dole sekcji głosowań */}
                                            {meeting.skipVotes.length > 0 && (
                                                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                                                    {/* Napis SKIP zamiast avatara */}
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-12 h-12 rounded-full border-2 border-yellow-400 bg-yellow-400/20 flex items-center justify-center">
                                                            <span className="text-yellow-300 font-bold text-s">SKIP</span>
                                                        </div>
                                                        <span className="text-lg font-semibold text-yellow-300">Skip</span>
                                                    </div>
                                                    
                                                    {/* Strzałka */}
                                                    <span className="text-gray-400">←</span>
                                                    
                                                    {/* Małe avatary głosujących na skip */}
                                                    <div className="flex space-x-1">
                                                        {meeting.skipVotes.map((voter, index) => (
                                                            <div key={index} className="relative group">
                                                                <Image
                                                                    src={getPlayerAvatarPath(voter)}
                                                                    alt={`Avatar ${voter}`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full border border-gray-400 hover:border-white transition-colors cursor-pointer"
                                                                />
                                                                {/* Tooltip z nickiem */}
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                                    {voter}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Liczba głosów */}
                                                    <span className="text-sm text-gray-400 ml-auto">
                                                        ({meeting.skipVotes.length} głos{meeting.skipVotes.length === 1 ? '' : meeting.skipVotes.length < 5 ? 'y' : 'ów'})
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Brak głosu na dole sekcji głosowań */}
                                            {meeting.noVotes.length > 0 && (
                                                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                                                    {/* Szary napis zamiast avatara */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg font-semibold text-gray-400">Brak głosu:</span>
                                                    </div>
                                                    
                                                    
                                                    {/* Małe avatary graczy którzy nie głosowali */}
                                                    <div className="flex space-x-1">
                                                        {meeting.noVotes.map((voter, index) => (
                                                            <div key={index} className="relative group">
                                                                <Image
                                                                    src={getPlayerAvatarPath(voter)}
                                                                    alt={`Avatar ${voter}`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full border border-gray-400 hover:border-white transition-colors cursor-pointer"
                                                                />
                                                                {/* Tooltip z nickiem */}
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                                    {voter}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Liczba graczy */}
                                                    <span className="text-sm text-gray-400 ml-auto">
                                                        ({meeting.noVotes.length} {meeting.noVotes.length === 1 ? 'gracz' : meeting.noVotes.length < 5 ? 'graczy' : 'graczy'})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        {meeting.blackmailedPlayers && meeting.blackmailedPlayers.length > 0 && (
                                            <div className="mb-2">
                                                <h4 className="font-semibold mb-2" style={{ color: '#FF0000' }}>🤐 Blackmailed:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {meeting.blackmailedPlayers.map((playerName, index) => (
                                                        <div key={index} className="flex items-center space-x-2 px-2 py-1 rounded" style={{ backgroundColor: '#FF000020', border: '1px solid #FF000050' }}>
                                                            <Image
                                                                src={getPlayerAvatarPath(playerName)}
                                                                alt={`Avatar ${playerName}`}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full border"
                                                                style={{ borderColor: '#FF0000' }}
                                                            />
                                                            <span className="text-base font-medium" style={{ color: '#FF6666' }}>{playerName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {meeting.jailedPlayers && meeting.jailedPlayers.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2" style={{ color: '#A5A5A5' }}>🔒 Jailed:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {meeting.jailedPlayers.map((playerName, index) => (
                                                        <div key={index} className="flex items-center space-x-2 px-2 py-1 rounded" style={{ backgroundColor: '#A5A5A520', border: '1px solid #A5A5A550' }}>
                                                            <Image
                                                                src={getPlayerAvatarPath(playerName)}
                                                                alt={`Avatar ${playerName}`}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full border"
                                                                style={{ borderColor: '#A5A5A5' }}
                                                            />
                                                            <span className="text-base font-medium" style={{ color: '#CCCCCC' }}>{playerName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <Link 
                        href={`/dramaafera/historia-gier/${date}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold inline-block"
                    >
                        ← Powrót do {displayDate}
                    </Link>
                </div>
            </div>
        </div>
    );
}
