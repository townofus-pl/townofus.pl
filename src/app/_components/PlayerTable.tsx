'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UIGameData, UIPlayerData } from '@/data/games/converter';

interface PlayerDayStats {
  name: string;
  avatar: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: ('W' | 'L' | null)[];
}

interface PlayerTableProps {
  players: PlayerDayStats[];
  reversedGames: { id: string }[];
  detailedGames: (UIGameData | null)[];
  date: string;
  hideZeroStats?: boolean; // Nowy prop do kontrolowania wyświetlania statystyk równych 0
}

export default function PlayerTable({ players, reversedGames, detailedGames, date, hideZeroStats = false }: PlayerTableProps) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // Funkcja pomocnicza do konwersji nicku na format URL-friendly
  const convertNickToUrlSlug = (nick: string): string => {
    return nick.replace(/\s+/g, '-').toLowerCase();
  };

  const togglePlayerExpansion = (playerName: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerName)) {
      newExpanded.delete(playerName);
    } else {
      newExpanded.add(playerName);
    }
    setExpandedPlayers(newExpanded);
  };

  const getPlayerAggregatedStats = (playerName: string) => {
    // Zbierz i zsumuj wszystkie statystyki gracza z tego dnia
    const aggregatedStats = {
      correctKills: 0,
      incorrectKills: 0,
      correctProsecutes: 0,
      incorrectProsecutes: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      correctDeputyShoots: 0,
      incorrectDeputyShoots: 0,
      correctJailorExecutes: 0,
      incorrectJailorExecutes: 0,
      correctMedicShields: 0,
      incorrectMedicShields: 0,
      correctWardenFortifies: 0,
      incorrectWardenFortifies: 0,
      janitorCleans: 0,
      completedTasks: 0,
      totalTasks: 0,
      survivedRounds: 0,
      totalRounds: 0,
      correctAltruistRevives: 0,
      incorrectAltruistRevives: 0,
      correctSwaps: 0,
      incorrectSwaps: 0,
      timesRevived: 0,
      timesKilled: 0,
      bodiesReported: 0,
      emergencyMeetingsCalled: 0,
      tasksCompleted: 0,
      sabotagesFixed: 0,
      deadBodiesReported: 0,
      timesDied: 0,
      timesEjected: 0,
      crewmatesKilled: 0,
      impostorsKilled: 0,
      neutralsKilled: 0,
      totalPoints: 0,
      gamesPlayed: 0
    };

    detailedGames.forEach((game) => {
      if (!game?.detailedStats?.playersData) return;
      
      const playerData = game.detailedStats.playersData.find((p: UIPlayerData) => p.nickname === playerName);
      if (!playerData?.originalStats) return;

      aggregatedStats.gamesPlayed++;
      const stats = playerData.originalStats;

      // Sumuj wszystkie statystyki oprócz tasków i rund
      aggregatedStats.correctKills += stats.correctKills || 0;
      aggregatedStats.incorrectKills += stats.incorrectKills || 0;
      aggregatedStats.correctMedicShields += stats.correctMedicShields || 0;
      aggregatedStats.incorrectMedicShields += stats.incorrectMedicShields || 0;
      aggregatedStats.correctJailorExecutes += stats.correctJailorExecutes || 0;
      aggregatedStats.incorrectJailorExecutes += stats.incorrectJailorExecutes || 0;
      aggregatedStats.correctDeputyShoots += stats.correctDeputyShoots || 0;
      aggregatedStats.incorrectDeputyShoots += stats.incorrectDeputyShoots || 0;
      aggregatedStats.correctProsecutes += stats.correctProsecutes || 0;
      aggregatedStats.incorrectProsecutes += stats.incorrectProsecutes || 0;
      aggregatedStats.correctWardenFortifies += stats.correctWardenFortifies || 0;
      aggregatedStats.incorrectWardenFortifies += stats.incorrectWardenFortifies || 0;
      aggregatedStats.correctAltruistRevives += stats.correctAltruistRevives || 0;
      aggregatedStats.incorrectAltruistRevives += stats.incorrectAltruistRevives || 0;
      aggregatedStats.correctSwaps += stats.correctSwaps || 0;
      aggregatedStats.incorrectSwaps += stats.incorrectSwaps || 0;
      aggregatedStats.correctGuesses += stats.correctGuesses || 0;
      aggregatedStats.incorrectGuesses += stats.incorrectGuesses || 0;
      aggregatedStats.janitorCleans += stats.janitorCleans || 0;
      
      // Dodaj przeżyte rundy dla tego gracza
      aggregatedStats.survivedRounds += stats.survivedRounds || 0;

      // Specjalna logika dla tasków: użyj maxTasks z gry
      if (stats.completedTasks && stats.completedTasks > 0) {
        aggregatedStats.completedTasks += stats.completedTasks;
        // Dodaj maxTasks z gry jeśli gracz wykonał jakieś zadania
        if (game.maxTasks) {
          aggregatedStats.totalTasks += game.maxTasks;
        }
      }

      // Specjalna logika dla przeżytych rund: znajdź maksimum dla tej konkretnej gry
      let maxRoundsInThisGame = 0;
      game.detailedStats.playersData.forEach((p: UIPlayerData) => {
        if (p.originalStats?.survivedRounds) {
          maxRoundsInThisGame = Math.max(maxRoundsInThisGame, p.originalStats.survivedRounds);
        }
      });
      
      // Dodaj maksimum z tej gry do mianownika
      if (maxRoundsInThisGame > 0) {
        aggregatedStats.totalRounds += maxRoundsInThisGame;
      }
    });

    return aggregatedStats;
  };

  return (
    <div className="overflow-x-visible">
      <table className="w-full border border-zinc-700 bg-zinc-800/80 rounded-lg table-fixed">
        <thead>
          <tr className="bg-zinc-900/80">
            <th
              className="text-yellow-400 font-bold"
              style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem', padding: '0.25rem 0.25rem' }}
            >
              #
            </th>
            <th className="px-2 py-2 text-yellow-400 font-bold" style={{ width: '12rem' }}>GRACZ</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">ILOŚĆ GIER</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">WIN</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">LOSE</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">WINRATIO</th>
            {reversedGames.map((g, idx: number) => (
              <th
                key={idx}
                className="text-yellow-400 font-bold text-xs p-0"
                style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem' }}
              >
                <Link
                  href={`/dramaafera/historia-gier/${date}/${g.id}`}
                  className="block w-full h-full py-2 hover:underline hover:text-blue-400 text-center"
                  style={{ minWidth: '2.5rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {idx + 1}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx: number) => {
            const isExpanded = expandedPlayers.has(player.name);
            const playerStats = getPlayerAggregatedStats(player.name);
            
            return (
              <>
                <tr key={player.name} className="border-b border-zinc-700">
                  <td
                    className="text-center text-yellow-300 font-bold"
                    style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem', height: '2.5rem', padding: 0 }}
                  >
                    <span className="flex items-center justify-center w-full h-full" style={{ minHeight: '2.5rem' }}>{idx + 1}</span>
                  </td>
                  <td className="px-2 py-1 flex items-center gap-2">
                    <Image src={player.avatar} alt={player.name} width={32} height={32} className="rounded-full border border-zinc-600" />
                    <Link 
                      href={`/dramaafera/user/${convertNickToUrlSlug(player.name)}`}
                      className="font-bold text-orange-300 hover:text-orange-200 transition-colors"
                    >
                      {player.name}
                    </Link>
                    <button
                      onClick={() => togglePlayerExpansion(player.name)}
                      className="ml-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Pokaż szczegółowe statystyki"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="px-2 py-1 text-center">{player.games}</td>
                  <td className="px-2 py-1 text-center text-green-400 font-bold">{player.wins}</td>
                  <td className="px-2 py-1 text-center text-red-400 font-bold">{player.loses}</td>
                  <td className="px-2 py-1 text-center font-bold" style={{ color: player.winRatio >= 50 ? '#22C55E' : player.winRatio >= 30 ? '#F59E0B' : '#EF4444' }}>{player.winRatio.toFixed(2)}%</td>
                  {player.results.map((res, i) => {
                    // Pobierz rolę gracza w danej grze (jeśli grał)
                    let role = '';
                    const game = detailedGames[i];
                    if (game && game.detailedStats && game.detailedStats.playersData) {
                      const found = game.detailedStats.playersData.find((p: UIPlayerData) => p.nickname === player.name);
                      if (found) {
                        // Jeśli jest historia ról, pokaż ostatnią
                        if (found.roleHistory && found.roleHistory.length > 0) {
                          role = found.roleHistory[found.roleHistory.length - 1];
                        } else if (found.role) {
                          role = found.role;
                        }
                      }
                    }
                    return (
                      <td
                        key={i}
                        className={`text-center font-bold relative group ${res === 'W' ? 'bg-green-700/80 text-green-300' : res === 'L' ? 'bg-red-800/80 text-red-300' : 'bg-zinc-900/40'}`}
                        style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem', height: '2.5rem', padding: 0 }}
                      >
                        <span className="flex items-center justify-center w-full h-full" style={{ minHeight: '2.5rem' }}>{res || ''}</span>
                        {role && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 max-w-xs shadow-lg border border-gray-700">
                            {role}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && (
                  <tr className="bg-zinc-900/60">
                    <td colSpan={6 + reversedGames.length} className="px-4 py-4">
                      <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-600">
                        <h4 className="text-lg font-bold text-yellow-400 mb-3">Zsumowane statystyki gracza {player.name} ({playerStats.gamesPlayed} gier)</h4>
                        
                        {/* Podsumowanie poprawności */}
                        {!hideZeroStats && (
                          <div className="bg-zinc-700/40 rounded-lg p-3 mb-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                              <div>
                                <div className="text-lg font-bold text-green-400">
                                  {playerStats.correctKills + playerStats.correctGuesses + playerStats.correctMedicShields + 
                                   playerStats.correctJailorExecutes + playerStats.correctDeputyShoots + playerStats.correctProsecutes +
                                   playerStats.correctWardenFortifies + playerStats.correctAltruistRevives + playerStats.correctSwaps}
                                </div>
                                <div className="text-xs text-zinc-400">Poprawne zagrania</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-red-400">
                                  {playerStats.incorrectKills + playerStats.incorrectGuesses + playerStats.incorrectMedicShields + 
                                   playerStats.incorrectJailorExecutes + playerStats.incorrectDeputyShoots + playerStats.incorrectProsecutes +
                                   playerStats.incorrectWardenFortifies + playerStats.incorrectAltruistRevives + playerStats.incorrectSwaps}
                                </div>
                                <div className="text-xs text-zinc-400">Niepoprawne zagrania</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-blue-300">
                                  {(playerStats.correctKills + playerStats.correctGuesses + playerStats.correctMedicShields + 
                                    playerStats.correctJailorExecutes + playerStats.correctDeputyShoots + playerStats.correctProsecutes +
                                    playerStats.correctWardenFortifies + playerStats.correctAltruistRevives + playerStats.correctSwaps) +
                                   (playerStats.incorrectKills + playerStats.incorrectGuesses + playerStats.incorrectMedicShields + 
                                    playerStats.incorrectJailorExecutes + playerStats.incorrectDeputyShoots + playerStats.incorrectProsecutes +
                                    playerStats.incorrectWardenFortifies + playerStats.incorrectAltruistRevives + playerStats.incorrectSwaps)}
                                </div>
                                <div className="text-xs text-zinc-400">Wszystkie zagrania</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-yellow-400">
                                  {(() => {
                                    const totalCorrect = playerStats.correctKills + playerStats.correctGuesses + playerStats.correctMedicShields + 
                                                        playerStats.correctJailorExecutes + playerStats.correctDeputyShoots + playerStats.correctProsecutes +
                                                        playerStats.correctWardenFortifies + playerStats.correctAltruistRevives + playerStats.correctSwaps;
                                    const totalIncorrect = playerStats.incorrectKills + playerStats.incorrectGuesses + playerStats.incorrectMedicShields + 
                                                           playerStats.incorrectJailorExecutes + playerStats.incorrectDeputyShoots + playerStats.incorrectProsecutes +
                                                           playerStats.incorrectWardenFortifies + playerStats.incorrectAltruistRevives + playerStats.incorrectSwaps;
                                    const total = totalCorrect + totalIncorrect;
                                    return total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
                                  })()}%
                                </div>
                                <div className="text-xs text-zinc-400">Współczynnik poprawności</div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          
                          {/* Statystyki zabójstw */}
                          {(!hideZeroStats || (playerStats.correctKills > 0 || playerStats.incorrectKills > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Kills</div>
                              {(!hideZeroStats || playerStats.correctKills > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctKills}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectKills > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectKills}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki tarcz medyka */}
                          {(!hideZeroStats || (playerStats.correctMedicShields > 0 || playerStats.incorrectMedicShields > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Medic Shields</div>
                              {(!hideZeroStats || playerStats.correctMedicShields > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctMedicShields}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectMedicShields > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectMedicShields}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Jailor Executes */}
                          {(!hideZeroStats || (playerStats.correctJailorExecutes > 0 || playerStats.incorrectJailorExecutes > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Jailor Executes</div>
                              {(!hideZeroStats || playerStats.correctJailorExecutes > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctJailorExecutes}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectJailorExecutes > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectJailorExecutes}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Deputy Shoots */}
                          {(!hideZeroStats || (playerStats.correctDeputyShoots > 0 || playerStats.incorrectDeputyShoots > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Deputy Shoots</div>
                              {(!hideZeroStats || playerStats.correctDeputyShoots > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctDeputyShoots}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectDeputyShoots > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectDeputyShoots}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Prosecutes */}
                          {(!hideZeroStats || (playerStats.correctProsecutes > 0 || playerStats.incorrectProsecutes > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Prosecutes</div>
                              {(!hideZeroStats || playerStats.correctProsecutes > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctProsecutes}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectProsecutes > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectProsecutes}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Warden Fortifies */}
                          {(!hideZeroStats || (playerStats.correctWardenFortifies > 0 || playerStats.incorrectWardenFortifies > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Warden Fortifies</div>
                              {(!hideZeroStats || playerStats.correctWardenFortifies > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctWardenFortifies}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectWardenFortifies > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectWardenFortifies}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Altruist Revives */}
                          {(!hideZeroStats || (playerStats.correctAltruistRevives > 0 || playerStats.incorrectAltruistRevives > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Altruist Revives</div>
                              {(!hideZeroStats || playerStats.correctAltruistRevives > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctAltruistRevives}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectAltruistRevives > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectAltruistRevives}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Swaps */}
                          {(!hideZeroStats || (playerStats.correctSwaps > 0 || playerStats.incorrectSwaps > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Swaps</div>
                              {(!hideZeroStats || playerStats.correctSwaps > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctSwaps}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectSwaps > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectSwaps}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki zadań */}
                          {(!hideZeroStats || (playerStats.completedTasks > 0 || playerStats.totalTasks > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Tasks</div>
                              <div className="text-blue-400">
                                Completed: {playerStats.completedTasks}/{playerStats.totalTasks}
                              </div>
                              {playerStats.totalTasks > 0 && (
                                <div className="text-xs text-zinc-400">
                                  {Math.round((playerStats.completedTasks / playerStats.totalTasks) * 100)}% completed
                                </div>
                              )}
                            </div>
                          )}

                          {/* Statystyki przetrwanych rund */}
                          {(!hideZeroStats || (playerStats.survivedRounds > 0 || playerStats.totalRounds > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Survived Rounds</div>
                              <div className="text-cyan-400">
                                Survived rounds: {playerStats.survivedRounds}/{playerStats.totalRounds}
                              </div>
                              {playerStats.totalRounds > 0 && (
                                <div className="text-xs text-zinc-400">
                                  {Math.round((playerStats.survivedRounds / playerStats.totalRounds) * 100)}% survived
                                </div>
                              )}
                            </div>
                          )}

                          {/* Statystyki zgadywań */}
                          {(!hideZeroStats || (playerStats.correctGuesses > 0 || playerStats.incorrectGuesses > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Guesses</div>
                              {(!hideZeroStats || playerStats.correctGuesses > 0) && (
                                <div className="text-green-400">Correct: {playerStats.correctGuesses}</div>
                              )}
                              {(!hideZeroStats || playerStats.incorrectGuesses > 0) && (
                                <div className="text-red-400">Incorrect: {playerStats.incorrectGuesses}</div>
                              )}
                            </div>
                          )}

                          {/* Janitor Cleans */}
                          {(!hideZeroStats || playerStats.janitorCleans > 0) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Janitor Cleans</div>
                              <div className="text-purple-400">{playerStats.janitorCleans}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
