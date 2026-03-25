import { EmperorPoll } from './types';
import { videotext } from './constants';
import { AvatarImageSized } from './AvatarImage';

interface EmperorPollSlideProps {
    isFullscreen: boolean;
    step: number;
    emperorPoll: EmperorPoll;
}

export default function EmperorPollSlide({ isFullscreen, step, emperorPoll }: EmperorPollSlideProps) {
    // Krok 0: Pytanie
    if (step === 0) {
        return (
            <div className="relative flex items-center justify-center h-full">
                <div className="text-center px-8">
                    <h1 
                        className={`${videotext.className} font-bold leading-tight ${isFullscreen ? 'text-9xl' : 'text-5xl'}`}
                        style={{
                            color: 'rgba(226, 185, 49, 1)',
                            textShadow: '0 0 20px rgba(194, 165, 69, 0.5)',
                            letterSpacing: isFullscreen ? '-0.05em' : '-0.02em'
                        }}
                    >
                        KTO ZOSTANIE EMPEROREM<br />WEDŁUG ANKIETOWANYCH?
                    </h1>
                </div>
            </div>
        );
    }

    // Krok 1: Wykres słupkowy - posortowany od najwyższego do najniższego
    const sortedVotes = [...emperorPoll.votes].sort((a, b) => b.votes - a.votes);
    const maxVotes = Math.max(1, sortedVotes.length > 0 ? Math.max(...sortedVotes.map(v => v.votes)) : 0);
    const safeTotalVotes = Math.max(1, emperorPoll.totalVotes);
    const chartHeight = isFullscreen ? 400 : 250;
    const barWidth = isFullscreen ? 120 : 80;
    const gap = isFullscreen ? 40 : 20;
    const avatarSize = isFullscreen ? 80 : 50;

    return (
        <div className="relative flex items-center justify-center h-full px-8">
            <div className="flex flex-col items-center w-full max-w-7xl">
                {/* Tytuł */}
                <h2 
                    className={`${videotext.className} font-bold mb-8 ${isFullscreen ? 'text-9xl' : 'text-4xl'}`}
                    style={{ 
                        color: 'rgba(245, 216, 122, 1)',
                        letterSpacing: isFullscreen ? '-0.05em' : '-0.02em'
                    }}
                >
                    WYNIKI ANKIETY
                </h2>

                {/* Wykres słupkowy */}
                <div className="flex items-end justify-center" style={{ gap: `${gap}px`, minHeight: `${chartHeight + 150}px` }}>
                    {sortedVotes.map((vote, index) => {
                        const barHeight = Math.max(50, (vote.votes / maxVotes) * chartHeight);
                        const percentage = Math.round((vote.votes / safeTotalVotes) * 100);

                        return (
                            <div 
                                key={vote.nickname}
                                className="flex flex-col items-center"
                                style={{ width: `${barWidth}px` }}
                            >
                                {/* Liczba głosów i procent nad słupkiem */}
                                <div 
                                    className="text-center mb-2"
                                    style={{ 
                                        opacity: 0,
                                        animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`
                                    }}
                                >
                                    <div 
                                        className={`font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}
                                        style={{ color: 'rgba(245, 216, 122, 1)' }}
                                    >
                                        {vote.votes}
                                    </div>
                                    <div 
                                        className={`font-bold ${isFullscreen ? 'text-2xl' : 'text-lg'}`}
                                        style={{ color: 'rgba(245, 216, 122, 1)' }}
                                    >
                                        {percentage}%
                                    </div>
                                </div>

                                {/* Słupek */}
                                <div 
                                    className="relative w-full shadow-xl"
                                    style={{ 
                                        height: `${barHeight}px`,
                                        opacity: 0,
                                        animation: `slideUpBar 0.8s ease-out ${index * 0.1}s forwards`,
                                        backgroundColor: 'rgba(245, 216, 122, 1)'
                                    }}
                                >
                                </div>

                                {/* Avatar i nick gracza - zawsze na dole */}
                                <div 
                                    className="flex flex-col items-center mt-4"
                                    style={{ 
                                        opacity: 0,
                                        animation: `fadeIn 0.6s ease-out ${index * 0.1 + 0.4}s forwards`
                                    }}
                                >
                                    <div 
                                        className="relative overflow-hidden"
                                        style={{ 
                                            width: `${avatarSize}px`, 
                                            height: `${avatarSize}px`,
                                            border: '3px solid rgba(245, 216, 122, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                        }}
                                    >
                                        <AvatarImageSized
                                            nickname={vote.nickname}
                                            size={avatarSize}
                                            className="object-cover"
                                            priority
                                        />
                                        {/* Warstwa wewnętrznego cienia */}
                                        <div 
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                boxShadow: 'inset 0 0 20px rgba(197, 176, 98, 0.3), inset 0 0 10px rgba(207, 178, 72, 0.2)'
                                            }}
                                        />
                                    </div>
                                    <div className={`font-bold text-white mt-2 text-center ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                                        {vote.nickname}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
