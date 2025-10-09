"use client";

import type { RankingHistoryPoint } from "../../_services/gameDataService";

// Komponent wykresu rankingu
export function RankingChart({ data, playerName }: { data: RankingHistoryPoint[]; playerName?: string }) {
    if (data.length === 0) return null;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 300; // Będziemy używać viewBox dla responsywności
    const height = 150;  // Relatywne proporcje
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Przygotowanie danych
    const minScore = Math.min(...data.map(d => d.score));
    const maxScore = Math.max(...data.map(d => d.score));
    const scoreRange = maxScore - minScore || 1;

    // Funkcje skalowania - X bazuje na równomiernym rozmieszczeniu punktów
    const scaleX = (index: number) => (index / (data.length - 1)) * chartWidth;
    const scaleY = (score: number) => chartHeight - ((score - minScore) / scoreRange) * chartHeight;

    // Generowanie linii wykresu
    const pathData = data
        .map((point, index) => {
            const x = scaleX(index);
            const y = scaleY(point.score);
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        })
        .join(' ');

    // Formatowanie dat dla osi X
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit'
        }).format(date);
    };

    // Formatowanie daty dla URL (YYYYMMDD)
    const formatDateForUrl = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    // Funkcja obsługi kliknięcia w punkt
    const handlePointClick = (point: RankingHistoryPoint) => {
        if (point.gameIdentifier) {
            const dateStr = formatDateForUrl(point.date);
            window.open(`/dramaafera-new/historia-gier/${dateStr}/${point.gameIdentifier}`, '_blank');
        }
    };

    // Punkty na osi X (co kilka punktów dla czytelności)
    const xAxisPoints = data.filter((_, index) => 
        index === 0 || 
        index === data.length - 1 || 
        index % Math.ceil(data.length / 5) === 0
    );

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg 
                viewBox={`0 0 ${width} ${height}`}
                className="text-white w-full h-full max-w-4xl"
                preserveAspectRatio="xMidYMid meet"
            >
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Linie siatki */}
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                        <g key={ratio}>
                            <line
                                x1={0}
                                y1={chartHeight * ratio}
                                x2={chartWidth}
                                y2={chartHeight * ratio}
                                stroke="rgb(80, 80, 80)"
                                strokeWidth={0.2}
                                strokeDasharray="none"
                            />
                            <text
                                x={-10}
                                y={chartHeight * ratio + 4}
                                fill="rgb(161, 161, 170)"
                                fontSize="6"
                                textAnchor="end"
                            >
                                {Math.round(maxScore - (ratio * scoreRange))}
                            </text>
                        </g>
                    ))}

                    {/* Oś X */}
                    <line
                        x1={0}
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={0.8}
                    />

                    {/* Oś Y */}
                    <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={0.8}
                    />

                    {/* Pionowe linie siatki */}
                    {xAxisPoints.map((point, _pointIndex) => {
                        const originalIndex = data.findIndex(d => d.date.getTime() === point.date.getTime());
                        return (
                            <line
                                key={`grid-${point.date.getTime()}`}
                                x1={scaleX(originalIndex)}
                                y1={0}
                                x2={scaleX(originalIndex)}
                                y2={chartHeight}
                                stroke="rgb(80, 80, 80)"
                                strokeWidth={0.2}
                            />
                        );
                    })}

                    {/* Etykiety osi X */}
                    {xAxisPoints.map((point) => {
                        const originalIndex = data.findIndex(d => d.date.getTime() === point.date.getTime());
                        return (
                            <text
                                key={point.date.getTime()}
                                x={scaleX(originalIndex)}
                                y={chartHeight + 4}
                                fill="rgb(161, 161, 170)"
                                fontSize="6"
                                textAnchor="middle"
                            >
                                {formatDate(point.date)}
                            </text>
                        );
                    })}

                    {/* Linia wykresu */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="rgb(255, 255, 0)"
                        strokeWidth={2}
                    />

                    {/* Punkty na wykresie */}
                    {data.map((point, index) => (
                        <g key={index}>
                            <circle
                                cx={scaleX(index)}
                                cy={scaleY(point.score)}
                                r={1.5}
                                fill="white"
                                stroke="rgb(255, 255, 0)"
                                strokeWidth={0.3}
                                className={`transition-all duration-200 ${point.gameIdentifier ? 'hover:r-2 hover:stroke-2' : ''}`}
                            />
                            
                            {/* Tooltip na hover z linkiem */}
                            <circle
                                cx={scaleX(index)}
                                cy={scaleY(point.score)}
                                r={3}
                                fill="transparent"
                                className={`hover:fill-yellow-500/30 ${point.gameIdentifier ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={point.gameIdentifier ? () => handlePointClick(point) : undefined}
                            >
                                <title>
                                    {formatDate(point.date)}: {Math.round(point.score)} punktów
                                    {point.gameIdentifier && ` | Kliknij aby zobaczyć grę`}
                                    {point.reason && ` (${point.reason})`}
                                </title>
                            </circle>
                        </g>
                    ))}

                    {/* Etykiety osi */}
                    <text
                        x={chartWidth / 2}
                        y={height - 1}
                        fill="rgb(161, 161, 170)"
                        fontSize="6"
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        Data
                    </text>
                    
                    <text
                        x={-5}
                        y={chartHeight / 2}
                        fill="rgb(161, 161, 170)"
                        fontSize="5"
                        textAnchor="middle"
                        fontWeight="bold"
                        transform={`rotate(-90, -5, ${chartHeight / 2})`}
                    >
                        Punkty rankingowe
                    </text>

                    {/* Etykieta gracza w prawym górnym rogu */}
                    {playerName && (
                        <text
                            x={chartWidth - 2}
                            y={8}
                            fill="rgb(255, 255, 0)"
                            fontSize="6"
                            textAnchor="end"
                            fontWeight="bold"
                        >
                            {playerName}
                        </text>
                    )}
                </g>
            </svg>
        </div>
    );
}