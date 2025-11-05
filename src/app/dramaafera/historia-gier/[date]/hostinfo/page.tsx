import { getGamesListByDate, getGameData, formatDisplayDate, UIGameData, UIPlayerData } from '../../../_services/gameDataService';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../../../api/_database';
import { withoutDeleted } from '../../../../api/schema/common';

export async function generateStaticParams() {
  // Return empty array during build time as Cloudflare context is not available
  // This will be populated at runtime
  return [];
}

interface PlayerHostInfo {
  name: string;
  avatar: string;
  totalPoints: number;
  games: number;
}

interface PlayerRankingChange {
  name: string;
  avatar: string;
  rankBefore: number;
  rankAfter: number;
  change: number;
  ratingBefore: number;
  ratingAfter: number;
}

interface HostInfoPageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function HostInfoPage({ params }: HostInfoPageProps) {
  const { date } = await params;
  const games = await getGamesListByDate(date);
  
  if (!games || games.length === 0) {
    notFound();
  }

  const displayDate = formatDisplayDate(date);

  // Pobierz Cloudflare context i Prisma client
  const { env } = await getCloudflareContext();
  const prisma = getPrismaClient(env.DB);

  // Pobierz szczegółowe dane wszystkich gier
  const detailedGames = await Promise.all(
    games.map(async (game): Promise<UIGameData | null> => await getGameData(game.id))
  );

  // Znajdź pierwsze i ostatnie gry dnia (sortujemy gameIdentifier chronologicznie)
  const sortedGames = [...games].sort((a, b) => a.id.localeCompare(b.id));
  const firstGameIdentifier = sortedGames[0]?.id;
  const lastGameIdentifier = sortedGames[sortedGames.length - 1]?.id;

  // Pobierz gry z bazy, żeby mieć ich ID numeryczne
  const firstGameDb = await prisma.game.findUnique({
    where: { gameIdentifier: firstGameIdentifier, ...withoutDeleted }
  });
  const lastGameDb = await prisma.game.findUnique({
    where: { gameIdentifier: lastGameIdentifier, ...withoutDeleted }
  });

  if (!firstGameDb || !lastGameDb) {
    notFound();
  }

  // Pobierz najnowszy ranking przed pierwszą grą dnia dla każdego gracza
  // Używamy podquerki dla każdego gracza aby znaleźć ostatni ranking przed sesją
  const playersBeforeQuery = await prisma.$queryRaw<Array<{ playerId: number; playerName: string; score: number }>>`
    SELECT DISTINCT
      p.id as playerId,
      p.name as playerName,
      COALESCE(
        (SELECT pr.score 
         FROM player_rankings pr 
         WHERE pr.playerId = p.id 
           AND pr.deletedAt IS NULL
           AND (pr.gameId IS NULL OR pr.gameId < ${firstGameDb.id})
         ORDER BY pr.createdAt DESC 
         LIMIT 1),
        2000
      ) as score
    FROM players p
    WHERE p.deletedAt IS NULL
  `;

  // Pobierz najnowszy ranking po ostatniej grze dnia dla każdego gracza
  const playersAfterQuery = await prisma.$queryRaw<Array<{ playerId: number; playerName: string; score: number }>>`
    SELECT DISTINCT
      p.id as playerId,
      p.name as playerName,
      COALESCE(
        (SELECT pr.score 
         FROM player_rankings pr 
         WHERE pr.playerId = p.id 
           AND pr.deletedAt IS NULL
           AND (pr.gameId IS NULL OR pr.gameId <= ${lastGameDb.id})
         ORDER BY pr.createdAt DESC 
         LIMIT 1),
        2000
      ) as score
    FROM players p
    WHERE p.deletedAt IS NULL
  `;

  // Zbierz statystyki graczy (punkty)
  const playerMap = new Map<string, PlayerHostInfo>();

  detailedGames.forEach((game) => {
    if (!game?.detailedStats?.playersData) return;
    
    game.detailedStats.playersData.forEach((player: UIPlayerData) => {
      if (!playerMap.has(player.nickname)) {
        playerMap.set(player.nickname, {
          name: player.nickname,
          avatar: `/images/avatars/${player.nickname}.png`,
          totalPoints: 0,
          games: 0
        });
      }
      
      const stats = playerMap.get(player.nickname)!;
      stats.totalPoints += player.totalPoints;
      stats.games++;
    });
  });

  // Stwórz mapy rankingów
  const rankingBeforeMap = new Map(
    playersBeforeQuery.map(r => [r.playerName, r.score])
  );
  
  const rankingAfterMap = new Map(
    playersAfterQuery.map(r => [r.playerName, r.score])
  );

  // Posortuj rankingi przed i po, żeby określić pozycje
  const sortedBefore = Array.from(rankingBeforeMap.entries())
    .sort((a, b) => (b[1] as number) - (a[1] as number));
  const sortedAfter = Array.from(rankingAfterMap.entries())
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  const rankPositionBefore = new Map(
    sortedBefore.map(([name], index) => [name, index + 1])
  );
  const rankPositionAfter = new Map(
    sortedAfter.map(([name], index) => [name, index + 1])
  );

  // Oblicz zmiany w rankingu dla graczy którzy grali w tej sesji
  const rankingChanges: PlayerRankingChange[] = Array.from(playerMap.keys())
    .map(playerName => {
      const rankBefore = rankPositionBefore.get(playerName) || 0;
      const rankAfter = rankPositionAfter.get(playerName) || 0;
      const ratingBefore = rankingBeforeMap.get(playerName) || 2000;
      const ratingAfter = rankingAfterMap.get(playerName) || 2000;
      
      return {
        name: playerName,
        avatar: `/images/avatars/${playerName}.png`,
        rankBefore,
        rankAfter,
        change: rankBefore - rankAfter, // Dodatnia wartość = awans
        ratingBefore: Number(ratingBefore),
        ratingAfter: Number(ratingAfter)
      };
    })
    .filter(p => p.rankBefore > 0 && p.rankAfter > 0) // Tylko gracze z rankingiem
    .sort((a, b) => (b.ratingAfter - b.ratingBefore) - (a.ratingAfter - a.ratingBefore)); // Sortuj od największej różnicy

  // Posortuj graczy po punktach (malejąco)
  const players = Array.from(playerMap.values())
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] mb-2">
            Informacje dla Hosta
          </h1>
          <h2 className="text-3xl font-brook text-center text-gray-300">
            {displayDate}
          </h2>
          <p className="text-center text-gray-400 mt-4 text-lg">
            Suma punktów wszystkich graczy z sesji ({games.length} {games.length === 1 ? 'rozgrywka' : games.length < 5 ? 'rozgrywki' : 'rozgrywek'})
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/70 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Gracz
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Gry
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Suma Punktów
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {players.map((player, index) => (
                    <tr 
                      key={player.name}
                      className="hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 font-mono">
                        {index + 1}.
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                            <Image
                              src={player.avatar}
                              alt={player.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-lg">
                            {player.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300">
                        {player.games}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xl font-bold text-white">
                          {player.totalPoints.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Podsumowanie statystyk */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
              <div className="text-blue-300 text-sm uppercase tracking-wide mb-1">
                Gracze
              </div>
              <div className="text-3xl font-bold text-white">
                {players.length}
              </div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
              <div className="text-green-300 text-sm uppercase tracking-wide mb-1">
                Średnia punktów
              </div>
              <div className="text-3xl font-bold text-white">
                {players.length > 0 
                  ? (players.reduce((sum, p) => sum + p.totalPoints, 0) / players.length).toFixed(1)
                  : '0.0'}
              </div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
              <div className="text-purple-300 text-sm uppercase tracking-wide mb-1">
                Najwyższy wynik
              </div>
              <div className="text-3xl font-bold text-white">
                {players.length > 0 ? players[0].totalPoints.toFixed(1) : '0.0'}
              </div>
            </div>
          </div>

          {/* Tabela zmian w rankingu */}
          {rankingChanges.length > 0 && (
            <div className="mt-12">
              <div className="bg-zinc-900/70 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Gracz
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Stary Ranking
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Nowy Ranking
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Różnica
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {rankingChanges.map((change) => (
                        <tr 
                          key={change.name}
                          className="hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                                <Image
                                  src={change.avatar}
                                  alt={change.name}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-semibold text-lg">
                                {change.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-white font-bold text-lg">
                                {Math.round(change.ratingBefore)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                #{change.rankBefore}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-white font-bold text-lg">
                                {Math.round(change.ratingAfter)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                #{change.rankAfter}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-xl font-bold ${
                              (change.ratingAfter - change.ratingBefore) > 0 
                                ? 'text-green-400' 
                                : (change.ratingAfter - change.ratingBefore) < 0 
                                ? 'text-red-400' 
                                : 'text-gray-400'
                            }`}>
                              {(change.ratingAfter - change.ratingBefore) > 0 ? '+' : ''}
                              {Math.round(change.ratingAfter) - Math.round(change.ratingBefore)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          

          {/* Link powrotny */}
          <div className="mt-8 text-center">
            <a
              href={`/dramaafera/historia-gier/${date}`}
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg shadow transition-colors"
            >
              ← Powrót do listy gier
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
