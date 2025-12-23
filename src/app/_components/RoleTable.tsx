'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UIGameData, UIPlayerData } from '@/data/games/converter';

interface RoleDayStats {
  name: string;
  displayName: string;
  color: string;
  team: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: ('W' | 'L' | null)[];
}

interface RoleTableProps {
  roles: RoleDayStats[];
  reversedGames: { id: string }[];
  detailedGames: (UIGameData | null)[];
  date: string;
  hideZeroStats?: boolean; // Nowy prop do kontrolowania wyświetlania statystyk równych 0
}

// Funkcja pomocnicza do konwersji nazwy roli na format URL-friendly
function convertRoleToUrlSlug(role: string): string {
  return role.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

export default function RoleTable({ roles, reversedGames, detailedGames, date, hideZeroStats = false }: RoleTableProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  // Funkcja do pobierania ikony roli - przeniesiona z komponentu serwerowego
  const getRoleIcon = (roleName: string): string => {
    const roleIconMappings: Record<string, string> = {
      'Crewmate': 'placeholder.png',
      'Impostor': 'placeholder.png',
      'Sheriff': 'sheriff.png',
      'Engineer': 'engineer.png',
      'Medic': 'medic.png',
      'Investigator': 'investigator.png',
      'Mystic': 'mystic.png',
      'Detective': 'detective.png',
      'Seer': 'seer.png',
      'Spy': 'spy.png',
      'Snitch': 'snitch.png',
      'Altruist': 'altruist.png',
      'Medium': 'medium.png',
      'Swapper': 'swapper.png',
      'Transporter': 'transporter.png',
      'Tracker': 'tracker.png',
      'Trapper': 'trapper.png',
      'Mayor': 'politician.png',
      'Politician': 'politician.png',
      'Vigilante': 'vigilante.png',
      'Veteran': 'veteran.png',
      'Hunter': 'hunter.png',
      'Deputy': 'deputy.png',
      'Undertaker': 'undertaker.png',
      'Imitator': 'imitator.png',
      'Prosecutor': 'prosecutor.png',
      'Oracle': 'oracle.png',
      'Aurial': 'aurial.png',
      'Lookout': 'lookout.png',
      'Jailor': 'jailor.png',
      'Morphling': 'morphling.png',
      'Swooper': 'swooper.png',
      'Miner': 'miner.png',
      'Escapist': 'escapist.png',
      'Grenadier': 'grenadier.png',
      'Traitor': 'traitor.png',
      'Blackmailer': 'blackmailer.png',
      'Janitor': 'janitor.png',
      'Vampire': 'vampire.png',
      'Hypnotist': 'hypnotist.png',
      'Bomber': 'bomber.png',
      'Warlock': 'warlock.png',
      'Venerer': 'venerer.png',
      'Jester': 'jester.png',
      'Executioner': 'executioner.png',
      'Arsonist': 'arsonist.png',
      'Plaguebearer': 'plaguebearer.png',
      'Pestilence': 'plaguebearer.png',
      'Glitch': 'glitch.png',
      'Juggernaut': 'juggernaut.png',
      'Survivor': 'survivor.png',
      'Guardian Angel': 'guardian_angel.png',
      'GuardianAngel': 'guardian_angel.png',
      'Amnesiac': 'amnesiac.png',
      'Phantom': 'phantom.png',
      'Doomsayer': 'doomsayer.png',
      'Scavenger': 'scavenger.png',
      'Soul Collector': 'soul_collector.png',
      'Mercenary': 'mercenary.png',
      'Cleric': 'cleric.png',
      'Warden': 'warden.png',
      'Plumber': 'plumber.png',
      'Eclipsal': 'eclipsal.png',
      'Haunter': 'haunter.png',
      'Werewolf': 'werewolf.png'
    };
    
    return roleIconMappings[roleName] || 'placeholder.png';
  };

  const toggleRoleExpansion = (roleName: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleName)) {
      newExpanded.delete(roleName);
    } else {
      newExpanded.add(roleName);
    }
    setExpandedRoles(newExpanded);
  };

  const getRoleAggregatedStats = (roleName: string) => {
    // Zbierz i zsumuj wszystkie statystyki roli z tego dnia
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
      gamesPlayed: 0,
      playersWithRole: [] as string[]
    };

    detailedGames.forEach((game) => {
      if (!game?.detailedStats?.playersData) return;
      
      const playersWithRole = game.detailedStats.playersData.filter((p: UIPlayerData) => {
        const playerRole = p.roleHistory && p.roleHistory.length > 0 
          ? p.roleHistory[p.roleHistory.length - 1] 
          : p.role || 'Unknown';
        return playerRole === roleName;
      });

      if (playersWithRole.length === 0) return;

      aggregatedStats.gamesPlayed++;

      // Znajdź maksimum dla tej konkretnej gry
      let maxRoundsInThisGame = 0;
      game.detailedStats.playersData.forEach((p: UIPlayerData) => {
        if (p.originalStats?.survivedRounds) {
          maxRoundsInThisGame = Math.max(maxRoundsInThisGame, p.originalStats.survivedRounds);
        }
      });

      playersWithRole.forEach((playerData: UIPlayerData) => {
        if (!aggregatedStats.playersWithRole.includes(playerData.nickname)) {
          aggregatedStats.playersWithRole.push(playerData.nickname);
        }
        
        if (!playerData.originalStats) return;
        
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
      });

      // Dodaj maksimum z tej gry do mianownika (dla każdego gracza z tą rolą)
      if (maxRoundsInThisGame > 0 && playersWithRole.length > 0) {
        aggregatedStats.totalRounds += maxRoundsInThisGame * playersWithRole.length;
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
            <th className="px-2 py-2 text-yellow-400 font-bold" style={{ width: '13rem' }}>ROLA</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">TEAM</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">GRY</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">WIN</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">LOSE</th>
            <th className="px-2 py-2 text-yellow-400 font-bold">W/R</th>
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
          {roles.map((role, idx: number) => {
            const isExpanded = expandedRoles.has(role.name);
            const roleStats = getRoleAggregatedStats(role.name);
            
            return (
              <>
                <tr key={role.name} className="border-b border-zinc-700">
                  <td
                    className="text-center text-yellow-300 font-bold"
                    style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem', height: '2.5rem', padding: 0 }}
                  >
                    <span className="flex items-center justify-center w-full h-full" style={{ minHeight: '2.5rem' }}>{idx + 1}</span>
                  </td>
                  <td className="px-2 py-1 flex items-center gap-2">
                    <Image 
                      src={`/images/roles/${getRoleIcon(role.name)}`} 
                      alt={role.displayName} 
                      width={32} 
                      height={32} 
                      className="rounded border-2"
                      style={{ borderColor: role.color }}
                    />
                    <Link
                      href={`/dramaafera/role/${convertRoleToUrlSlug(role.name)}`}
                      className="font-bold hover:underline transition-colors"
                      style={{ color: role.color }}
                    >
                      {role.displayName}
                    </Link>
                    <button
                      onClick={() => toggleRoleExpansion(role.name)}
                      className="ml-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Pokaż szczegółowe statystyki"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="px-2 py-1 text-center">
                    <span 
                      className="font-medium"
                      style={{ 
                        color: role.team === 'Crewmate' ? '#00FFFF' : 
                               role.team === 'Impostor' ? '#FF0000' : 
                               '#808080' 
                      }}
                    >
                      {role.team === 'Crewmate' ? 'Crew' : 
                               role.team === 'Impostor' ? 'Imp' : 
                               'Neu' }
                    </span>
                  </td>
                  <td className="px-2 py-1 text-center">{role.games}</td>
                  <td className="px-2 py-1 text-center text-green-400 font-bold">{role.wins}</td>
                  <td className="px-2 py-1 text-center text-red-400 font-bold">{role.loses}</td>
                  <td className="px-2 py-1 text-center font-bold" style={{ color: role.winRatio >= 50 ? '#22C55E' : role.winRatio >= 30 ? '#F59E0B' : '#EF4444' }}>{role.winRatio.toFixed(0)}%</td>
                  {role.results.map((res, i) => (
                    <td
                      key={i}
                      className={`text-center font-bold ${res === 'W' ? 'bg-green-700/80 text-green-300' : res === 'L' ? 'bg-red-800/80 text-red-300' : 'bg-zinc-900/40'}`}
                      style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem', height: '2.5rem', padding: 0 }}
                    >
                      <span className="flex items-center justify-center w-full h-full" style={{ minHeight: '2.5rem' }}>{res || ''}</span>
                    </td>
                  ))}
                </tr>
                {isExpanded && (
                  <tr className="bg-zinc-900/60">
                    <td colSpan={7 + reversedGames.length} className="px-4 py-4">
                      <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-600">
                        <h4 className="text-lg font-bold text-yellow-400 mb-3">
                          Zsumowane statystyki roli <Link 
                            href={`/dramaafera/role/${convertRoleToUrlSlug(role.name)}`}
                            className="hover:underline"
                            style={{ color: role.color }}
                          >
                            {role.displayName}
                          </Link> ({roleStats.gamesPlayed} wystąpień)
                        </h4>
                        
                        {/* Podsumowanie poprawności */}
                        {!hideZeroStats && (
                          <div className="bg-zinc-700/40 rounded-lg p-3 mb-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                              <div>
                                <div className="text-lg font-bold text-green-400">
                                  {roleStats.correctKills + roleStats.correctGuesses + roleStats.correctMedicShields + 
                                   roleStats.correctJailorExecutes + roleStats.correctDeputyShoots + roleStats.correctProsecutes +
                                   roleStats.correctWardenFortifies + roleStats.correctAltruistRevives + roleStats.correctSwaps}
                                </div>
                                <div className="text-xs text-zinc-400">Poprawne zagrania</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-red-400">
                                  {roleStats.incorrectKills + roleStats.incorrectGuesses + roleStats.incorrectMedicShields + 
                                   roleStats.incorrectJailorExecutes + roleStats.incorrectDeputyShoots + roleStats.incorrectProsecutes +
                                   roleStats.incorrectWardenFortifies + roleStats.incorrectAltruistRevives + roleStats.incorrectSwaps}
                                </div>
                                <div className="text-xs text-zinc-400">Niepoprawne zagrania</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-blue-300">
                                  {(roleStats.correctKills + roleStats.correctGuesses + roleStats.correctMedicShields + 
                                    roleStats.correctJailorExecutes + roleStats.correctDeputyShoots + roleStats.correctProsecutes +
                                    roleStats.correctWardenFortifies + roleStats.correctAltruistRevives + roleStats.correctSwaps) +
                                   (roleStats.incorrectKills + roleStats.incorrectGuesses + roleStats.incorrectMedicShields + 
                                    roleStats.incorrectJailorExecutes + roleStats.incorrectDeputyShoots + roleStats.incorrectProsecutes +
                                    roleStats.incorrectWardenFortifies + roleStats.incorrectAltruistRevives + roleStats.incorrectSwaps)}
                                </div>
                                <div className="text-xs text-zinc-400">Wszystkie zagrania</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-yellow-400">
                                  {(() => {
                                    const totalCorrect = roleStats.correctKills + roleStats.correctGuesses + roleStats.correctMedicShields + 
                                                        roleStats.correctJailorExecutes + roleStats.correctDeputyShoots + roleStats.correctProsecutes +
                                                        roleStats.correctWardenFortifies + roleStats.correctAltruistRevives + roleStats.correctSwaps;
                                    const totalIncorrect = roleStats.incorrectKills + roleStats.incorrectGuesses + roleStats.incorrectMedicShields + 
                                                           roleStats.incorrectJailorExecutes + roleStats.incorrectDeputyShoots + roleStats.incorrectProsecutes +
                                                           roleStats.incorrectWardenFortifies + roleStats.incorrectAltruistRevives + roleStats.incorrectSwaps;
                                    const total = totalCorrect + totalIncorrect;
                                    return total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
                                  })()}%
                                </div>
                                <div className="text-xs text-zinc-400">Współczynnik poprawności</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Lista graczy którzy grali tą rolą */}
                        <div className="mb-4">
                          <div className="text-sm font-medium text-zinc-300 mb-2">
                            Gracze którzy grali tą rolą ({roleStats.playersWithRole.length}):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {roleStats.playersWithRole.map((playerName, idx) => (
                              <span key={idx} className="bg-zinc-700/60 text-orange-300 px-2 py-1 rounded text-sm">
                                {playerName}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          
                          {/* Statystyki zabójstw */}
                          {(!hideZeroStats || (roleStats.correctKills > 0 || roleStats.incorrectKills > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Kills:</div>
                              {(!hideZeroStats || roleStats.correctKills > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctKills}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectKills > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectKills}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki tarcz medyka */}
                          {(!hideZeroStats || (roleStats.correctMedicShields > 0 || roleStats.incorrectMedicShields > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Medic Shields</div>
                              {(!hideZeroStats || roleStats.correctMedicShields > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctMedicShields}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectMedicShields > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectMedicShields}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Jailor Executes */}
                          {(!hideZeroStats || (roleStats.correctJailorExecutes > 0 || roleStats.incorrectJailorExecutes > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Jailor Executes</div>
                              {(!hideZeroStats || roleStats.correctJailorExecutes > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctJailorExecutes}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectJailorExecutes > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectJailorExecutes}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Deputy Shoots */}
                          {(!hideZeroStats || (roleStats.correctDeputyShoots > 0 || roleStats.incorrectDeputyShoots > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Deputy Shoots</div>
                              {(!hideZeroStats || roleStats.correctDeputyShoots > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctDeputyShoots}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectDeputyShoots > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectDeputyShoots}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Prosecutes */}
                          {(!hideZeroStats || (roleStats.correctProsecutes > 0 || roleStats.incorrectProsecutes > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Prosecutes</div>
                              {(!hideZeroStats || roleStats.correctProsecutes > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctProsecutes}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectProsecutes > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectProsecutes}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Warden Fortifies */}
                          {(!hideZeroStats || (roleStats.correctWardenFortifies > 0 || roleStats.incorrectWardenFortifies > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Warden Fortifies</div>
                              {(!hideZeroStats || roleStats.correctWardenFortifies > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctWardenFortifies}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectWardenFortifies > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectWardenFortifies}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Altruist Revives */}
                          {(!hideZeroStats || (roleStats.correctAltruistRevives > 0 || roleStats.incorrectAltruistRevives > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Altruist Revives</div>
                              {(!hideZeroStats || roleStats.correctAltruistRevives > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctAltruistRevives}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectAltruistRevives > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectAltruistRevives}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki Swaps */}
                          {(!hideZeroStats || (roleStats.correctSwaps > 0 || roleStats.incorrectSwaps > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Swaps</div>
                              {(!hideZeroStats || roleStats.correctSwaps > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctSwaps}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectSwaps > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectSwaps}</div>
                              )}
                            </div>
                          )}

                          {/* Statystyki zadań */}
                          {(!hideZeroStats || (roleStats.completedTasks > 0 || roleStats.totalTasks > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Tasks</div>
                              <div className="text-blue-400">
                                Completed: {roleStats.completedTasks}/{roleStats.totalTasks}
                              </div>
                              {roleStats.totalTasks > 0 && (
                                <div className="text-xs text-zinc-400">
                                  {Math.round((roleStats.completedTasks / roleStats.totalTasks) * 100)}% completed
                                </div>
                              )}
                            </div>
                          )}

                          {/* Statystyki przetrwanych rund */}
                          {(!hideZeroStats || (roleStats.survivedRounds > 0 || roleStats.totalRounds > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Survived rounds</div>
                              <div className="text-cyan-400">
                                Survived rounds: {roleStats.survivedRounds}/{roleStats.totalRounds}
                              </div>
                              {roleStats.totalRounds > 0 && (
                                <div className="text-xs text-zinc-400">
                                  {Math.round((roleStats.survivedRounds / roleStats.totalRounds) * 100)}% survived
                                </div>
                              )}
                            </div>
                          )}

                          {/* Statystyki zgadywań */}
                          {(!hideZeroStats || (roleStats.correctGuesses > 0 || roleStats.incorrectGuesses > 0)) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Guesses</div>
                              {(!hideZeroStats || roleStats.correctGuesses > 0) && (
                                <div className="text-green-400">Correct: {roleStats.correctGuesses}</div>
                              )}
                              {(!hideZeroStats || roleStats.incorrectGuesses > 0) && (
                                <div className="text-red-400">Incorrect: {roleStats.incorrectGuesses}</div>
                              )}
                            </div>
                          )}

                          {/* Janitor Cleans */}
                          {(!hideZeroStats || roleStats.janitorCleans > 0) && (
                            <div className="bg-zinc-700/60 rounded-lg p-3">
                              <div className="text-sm font-medium text-zinc-300 mb-1">Janitor Cleans</div>
                              <div className="text-purple-400">{roleStats.janitorCleans}</div>
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
