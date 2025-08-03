// Dodaj wymagany eksport generateStaticParams dla Next.js SSG
export async function generateStaticParams() {
  const dates = await getGameDatesList();
  return dates.map(dateGroup => ({ date: dateGroup.date }));
}
import { getGameDatesList, getGamesListByDate, getGameData } from '@/data/games';
import { normalizeRoleName, getRoleColor, determineTeam, UIGameData, UIPlayerData } from '@/data/games/converter';
import PlayerTable from '@/app/_components/PlayerTable';
import RoleTable from '@/app/_components/RoleTable';

interface PlayerDayStats {
  name: string;
  avatar: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: ('W' | 'L' | null)[];
}

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

export default async function WynikiDniaPage({ params }: { params: Promise<{ date: string }> }) {
  // Pobierz wszystkie gry z danego dnia (GameSummary)
  const { date } = await params;
  const games = await getGamesListByDate(date);
  if (!games || games.length === 0) {
    return <div className="text-center text-white py-12">Brak gier dla wybranego dnia.</div>;
  }

  // Pobierz szczegółowe dane każdej gry (UIGameData) w odwrotnej kolejności (od najnowszej)
  const reversedGames = [...games].reverse();

  const detailedGames = await Promise.all(reversedGames.map(async (game): Promise<UIGameData | null> => await getGameData(game.id)));

  // Zbierz wszystkich graczy i ich wyniki
  const playerMap = new Map<string, PlayerDayStats>();
  detailedGames.forEach((game, gameIdx) => {
    if (!game?.detailedStats?.playersData) return;
    game.detailedStats.playersData.forEach((player: UIPlayerData) => {
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

  // Zbierz wszystkie role i ich wyniki
  const roleMap = new Map<string, RoleDayStats>();
  detailedGames.forEach((game, gameIdx) => {
    if (!game?.detailedStats?.playersData) return;
    game.detailedStats.playersData.forEach((player: UIPlayerData) => {
      // Użyj ostatniej roli z historii lub podstawowej roli
      const roleName = player.roleHistory && player.roleHistory.length > 0 
        ? player.roleHistory[player.roleHistory.length - 1] 
        : player.role || 'Unknown';
      
      if (!roleMap.has(roleName)) {
        const displayName = normalizeRoleName(roleName);
        const color = getRoleColor(roleName);
        const team = determineTeam([roleName]);
        
        roleMap.set(roleName, {
          name: roleName,
          displayName: displayName,
          color: color,
          team: team,
          games: 0,
          wins: 0,
          loses: 0,
          winRatio: 0,
          results: Array(games.length).fill(null)
        });
      }
      const stats = roleMap.get(roleName)!;
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

  // Oblicz winratio ról i posortuj
  const roles = Array.from(roleMap.values()).map((r: RoleDayStats) => ({
    ...r,
    winRatio: r.games > 0 ? Math.round((r.wins / r.games) * 10000) / 100 : 0
  })).sort((a, b) => {
    if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.displayName.localeCompare(b.displayName);
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
      <h1 className="text-4xl font-bold mb-8 text-center">Wyniki dnia {date}</h1>
      
      <PlayerTable 
        players={players}
        reversedGames={reversedGames}
        detailedGames={detailedGames}
        date={date}
        hideZeroStats={true}
      />

      {/* Tabela ról */}
      <h2 className="text-3xl font-bold mb-6 mt-12 text-center">Statystyki ról</h2>
      <RoleTable 
        roles={roles}
        reversedGames={reversedGames}
        detailedGames={detailedGames}
        date={date}
        hideZeroStats={true}
      />

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
