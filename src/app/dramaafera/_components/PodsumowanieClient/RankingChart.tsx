import { FC } from 'react';
import { RankingHistoryPoint } from './types';

const CHART_COLORS = {
    sigma: {
        line: 'rgb(245, 196, 37)',
        gradientStart: 'rgb(238, 191, 39)',
        gradientEnd: 'rgba(245, 216, 122, 1)',
        dot: '#fbbf24',
        label: '#f5d87a',
    },
    cwel: {
        line: 'rgb(162, 17, 17)',
        gradientStart: 'rgb(162, 17, 17)',
        gradientEnd: 'rgb(162, 17, 17)',
        dot: '#ef4444',
        label: '#ef4444',
    },
} as const;

interface RankingChartProps {
    data: RankingHistoryPoint[];
    isFullscreen: boolean;
    weekDate: string;
    variant: 'sigma' | 'cwel';
}

export const RankingChart: FC<RankingChartProps> = ({ data, isFullscreen, weekDate, variant }) => {
    if (data.length === 0) return null;

    const colors = CHART_COLORS[variant];

    // Parsuj datę tygodnia (format YYYYMMDD)
    const year = parseInt(weekDate.substring(0, 4));
    const month = parseInt(weekDate.substring(4, 6)) - 1; // miesiące są 0-indeksowane
    const day = parseInt(weekDate.substring(6, 8));
    const weekStartDate = new Date(Date.UTC(year, month, day));
    const weekEndDate = new Date(Date.UTC(year, month, day + 7));

    // Filtruj dane: weź ostatni punkt przed tygodniem + wszystkie punkty z tygodnia
    const sortedData = [...data]
        .map(p => ({ ...p, _date: new Date(p.dateString) }))
        .sort((a, b) => a._date.getTime() - b._date.getTime());
    
    // Znajdź ostatni punkt przed początkiem tygodnia
    const pointsBeforeWeek = sortedData.filter(p => p._date < weekStartDate);
    const lastPointBefore = pointsBeforeWeek.length > 0 
        ? pointsBeforeWeek[pointsBeforeWeek.length - 1] 
        : null;
    
    // Punkty z tygodnia
    const pointsInWeek = sortedData.filter(p => p._date >= weekStartDate && p._date < weekEndDate);
    
    // Połącz: punkt sprzed tygodnia (jeśli istnieje) + punkty z tygodnia
    // Jeśli nie ma punktu sprzed tygodnia i są punkty z tygodnia, dodaj punkt startowy 2000
    let filteredData: (typeof sortedData)[number][];
    if (lastPointBefore) {
        filteredData = [lastPointBefore, ...pointsInWeek];
    } else if (pointsInWeek.length > 0) {
        // Gracz nie miał wcześniej rankingu - dodaj punkt startowy 2000
        const startPoint = {
            dateString: new Date(pointsInWeek[0]._date.getTime() - 1000).toISOString(),
            _date: new Date(pointsInWeek[0]._date.getTime() - 1000),
            rating: 2000,
            position: 0
        };
        filteredData = [startPoint, ...pointsInWeek];
    } else {
        filteredData = pointsInWeek;
    }
    
    if (filteredData.length === 0) return null;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800;
    const height = 400;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Przygotowanie danych
    const minScore = Math.min(...filteredData.map(d => d.rating));
    const maxScore = Math.max(...filteredData.map(d => d.rating));
    const scoreRange = maxScore - minScore || 1;
    const scorePadding = scoreRange * 0.1; // 10% padding

    // Funkcje skalowania
    const scaleX = (index: number) => (index / Math.max(filteredData.length - 1, 1)) * chartWidth;
    const scaleY = (score: number) => 
        chartHeight - ((score - (minScore - scorePadding)) / (scoreRange + 2 * scorePadding)) * chartHeight;

    // Generowanie linii wykresu
    const pathData = filteredData
        .map((point, index) => {
            const x = scaleX(index);
            const y = scaleY(point.rating);
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

    // Punkty na osi X (pierwsze, ostatnie i co kilka punktów)
    const xAxisPoints = filteredData.filter((_, index) => 
        index === 0 || 
        index === filteredData.length - 1 || 
        index % Math.ceil(filteredData.length / 8) === 0
    );

    const gradientId = `chartAreaGradient-${variant}`;

    return (
        <svg 
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            style={{ maxHeight: isFullscreen ? '500px' : '300px' }}
        >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Linie siatki poziome */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const score = (maxScore + scorePadding) - (ratio * (scoreRange + 2 * scorePadding));
                    return (
                        <g key={ratio}>
                            <line
                                x1={0}
                                y1={chartHeight * ratio}
                                x2={chartWidth}
                                y2={chartHeight * ratio}
                                stroke="rgb(80, 80, 80)"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                            />
                            <text
                                x={-10}
                                y={chartHeight * ratio + 5}
                                fill="rgb(161, 161, 170)"
                                fontSize={isFullscreen ? "20" : "12"}
                                textAnchor="end"
                            >
                                {Math.round(score)}
                            </text>
                        </g>
                    );
                })}

                {/* Oś X */}
                <line
                    x1={0}
                    y1={chartHeight}
                    x2={chartWidth}
                    y2={chartHeight}
                    stroke="rgb(156, 163, 175)"
                    strokeWidth={2}
                />

                {/* Oś Y */}
                <line
                    x1={0}
                    y1={0}
                    x2={0}
                    y2={chartHeight}
                    stroke="rgb(156, 163, 175)"
                    strokeWidth={2}
                />

                {/* Etykiety osi X */}
                {xAxisPoints.map((point) => {
                    const originalIndex = filteredData.findIndex(d => d._date.getTime() === point._date.getTime());
                    return (
                        <text
                            key={point._date.getTime()}
                            x={scaleX(originalIndex)}
                            y={chartHeight + 20}
                            fill="rgb(161, 161, 170)"
                            fontSize={isFullscreen ? "12" : "10"}
                            textAnchor="middle"
                        >
                            {formatDate(point._date)}
                        </text>
                    );
                })}

                {/* Linia wykresu */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Gradient pod wykresem */}
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.gradientStart} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={colors.gradientEnd} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Wypełnienie pod wykresem */}
                <path
                    d={`${pathData} L ${scaleX(filteredData.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`}
                    fill={`url(#${gradientId})`}
                />

                {/* Punkty na wykresie */}
                {filteredData.map((point, index) => {
                    const x = scaleX(index);
                    const y = scaleY(point.rating);
                    const isFirst = index === 0;
                    const isLast = index === filteredData.length - 1;
                    
                    return (
                        <g key={index}>
                            <circle
                                cx={x}
                                cy={y}
                                r={isFirst || isLast ? 6 : 4}
                                fill={colors.dot}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                            {(isFirst || isLast) && (
                                <text
                                    x={x}
                                    y={y - 15}
                                    fill={colors.label}
                                    fontSize={isFullscreen ? "16" : "14"}
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {Math.round(point.rating)}
                                </text>
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};
