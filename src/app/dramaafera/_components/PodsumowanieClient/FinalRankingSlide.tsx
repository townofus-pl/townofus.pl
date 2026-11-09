import { PlayerRankingAfterSession, WeeklyPlayerStats } from './types';
import { formatDate } from './constants';
import RankingTierTable from './RankingTierTable';

interface FinalRankingSlideProps {
    isFullscreen: boolean;
    currentStep: number;
    rankingAfterSession: PlayerRankingAfterSession[];
    weeklyStats: WeeklyPlayerStats[];
    date: string;
}

export default function FinalRankingSlide({ isFullscreen, currentStep, rankingAfterSession, weeklyStats, date }: FinalRankingSlideProps) {
    if (rankingAfterSession.length === 0) return null;

    // Krok 0: Tytuł
    if (currentStep === 0) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <h1
                    className={`font-bold text-amber-400 text-center ${isFullscreen ? 'text-7xl' : 'text-5xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(251, 191, 36, 0.7)'
                    }}
                >
                    AMONG US RANKING AFERA<br />PO {formatDate(date)}
                </h1>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col py-6" style={{ overflow: 'hidden' }}>
            {/* Nagłówek */}
            <div
                className={`text-center mt-10 mb-6 ${isFullscreen ? 'text-6xl' : 'text-5xl'} font-bold text-amber-400`}
                style={{ textShadow: '0 0 40px rgba(251, 191, 36, 0.9), 0 0 80px rgba(251, 191, 36, 0.6)', whiteSpace: 'nowrap', paddingLeft: '100px', paddingRight: '100px' }}
            >
                AMONG US RANKING AFERA PO {formatDate(date)}
            </div>

            {/* Tabela */}
            <div className="flex-1 px-80 overflow-y-auto flex items-center justify-center">
                <RankingTierTable isFullscreen={isFullscreen} rankingAfterSession={rankingAfterSession} weeklyStats={weeklyStats} animate />
            </div>
        </div>
    );
}
