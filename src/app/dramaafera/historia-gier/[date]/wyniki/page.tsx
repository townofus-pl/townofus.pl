// Dodaj wymagany eksport generateStaticParams dla Next.js SSG
export async function generateStaticParams() {
  const dates = await getGameDatesList();
  return dates.map(dateGroup => ({ date: dateGroup.date }));
}
import { getGameDatesList, getGamesListByDate, getGameData } from '@/data/games';
import Image from 'next/image';
import Link from 'next/link';

interface PlayerDayStats {
  name: string;
  avatar: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: ('W' | 'L' | null)[];
}

export default async function WynikiDniaPage({ params }: { params: { date: string } }) {
  // Pobierz wszystkie gry z danego dnia (GameSummary)
  const games = await getGamesListByDate(params.date);
  if (!games || games.length === 0) {
    return <div className="text-center text-white py-12">Brak gier dla wybranego dnia.</div>;
  }

  // Pobierz szczegółowe dane każdej gry (UIGameData) w odwrotnej kolejności (od najnowszej)
  const reversedGames = [...games].reverse();
  const detailedGames = await Promise.all(reversedGames.map(async (game) => await getGameData(game.id)));

  // Zbierz wszystkich graczy i ich wyniki
  const playerMap = new Map<string, PlayerDayStats>();
  detailedGames.forEach((game, gameIdx) => {
    if (!game?.detailedStats?.playersData) return;
    game.detailedStats.playersData.forEach((player: any) => {
      if (!playerMap.has(player.nickname)) {
        playerMap.set(player.nickname, {
          name: player.nickname,
          avatar: `/images/avatars/${player.nickname}.png`,
          games: 0,
          wins: 0,
          loses: 0,
          winRatio: 0,
          results: Array(games.length).fill(null)
        });
      }
      const stats = playerMap.get(player.nickname)!;
      stats.games++;
      if (player.win) {
        stats.wins++;
        stats.results[gameIdx] = 'W';
      } else {
        stats.loses++;
        stats.results[gameIdx] = 'L';
      }
    });
  });

  // Oblicz winratio i posortuj
  const players = Array.from(playerMap.values()).map((p: PlayerDayStats) => ({
    ...p,
    winRatio: p.games > 0 ? Math.round((p.wins / p.games) * 10000) / 100 : 0
  })).sort((a, b) => {
    if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name);
  });

  // Statystyki zwycięstw
  let crewmateWins = 0;
  let impostorWins = 0;
  let neutralWins = 0;
  detailedGames.forEach((game) => {
    if (!game) return;
    if (game.winner === 'Crewmate') crewmateWins++;
    else if (game.winner === 'Impostor') impostorWins++;
    else neutralWins++;
  });

  return (
    <div className="min-h-screen bg-zinc-900/80 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Wyniki dnia {params.date}</h1>
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
              <th className="px-2 py-2 text-yellow-400 font-bold">GRACZ</th>
              <th className="px-2 py-2 text-yellow-400 font-bold">ILOŚĆ GIER</th>
              <th className="px-2 py-2 text-yellow-400 font-bold">WIN</th>
              <th className="px-2 py-2 text-yellow-400 font-bold">LOSE</th>
              <th className="px-2 py-2 text-yellow-400 font-bold">WINRATIO</th>
      {reversedGames.map((g: any, idx: number) => (
        <th
          key={idx}
          className="text-yellow-400 font-bold text-xs p-0"
          style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem' }}
        >
          <Link
            href={`/dramaafera/historia-gier/${params.date}/${g.id}`}
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
            {players.map((player, idx: number) => (
              <tr key={player.name} className="border-b border-zinc-700">
                <td
                  className="text-center text-yellow-300 font-bold"
                  style={{ minWidth: '2.5rem', width: '2.5rem', maxWidth: '3.5rem', height: '2.5rem', padding: 0 }}
                >
                  <span className="flex items-center justify-center w-full h-full" style={{ minHeight: '2.5rem' }}>{idx + 1}</span>
                </td>
                <td className="px-2 py-1 flex items-center gap-2">
                  <Image src={player.avatar} alt={player.name} width={32} height={32} className="rounded-full border border-zinc-600" />
                  <span className="font-bold text-orange-300">{player.name}</span>
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
                    const found = game.detailedStats.playersData.find((p: any) => p.nickname === player.name);
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
            ))}
          </tbody>
        </table>
      </div>
      {/* Statystyki zwycięstw pod tabelą */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-lg">
        <div className="bg-blue-900/60 rounded-lg px-6 py-3 border border-blue-700/50 text-blue-200 font-semibold flex items-center gap-2">
          <span className="text-blue-400 text-2xl"></span>Wygrane Crewmatów: <span className="text-blue-300 font-bold">{crewmateWins}</span>
        </div>
        <div className="bg-red-900/60 rounded-lg px-6 py-3 border border-red-700/50 text-red-200 font-semibold flex items-center gap-2">
          <span className="text-red-400 text-2xl"></span>Wygrane Impostorów: <span className="text-red-300 font-bold">{impostorWins}</span>
        </div>
        <div className="bg-yellow-900/60 rounded-lg px-6 py-3 border border-yellow-700/50 text-yellow-200 font-semibold flex items-center gap-2">
          <span className="text-yellow-400 text-2xl"></span>Wygrane Neutrali: <span className="text-yellow-300 font-bold">{neutralWins}</span>
        </div>
      </div>
    </div>
  );
}
