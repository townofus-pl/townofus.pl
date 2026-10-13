"use client";

import { useId, useState } from "react";
import type { RankingHistoryPoint } from "../_services";
import { buildSeasonUrl } from "../_utils/seasonHelpers";
import { getPlayerAvatarPath } from '../_utils/gameUtils';
import { getRankingComparisonColor } from '../_utils/rankingComparisonColors';
import { RANK_TIERS } from '../_constants/rankTiers';

// Typy krzywych dostępne w wykresie
type CurveType = 'linear' | 'smooth' | 'step' | 'cardinal' | 'monotone';

// Komponent wykresu rankingu
export function RankingChart({ 
    data, 
    playerName,
    curveType = 'cardinal',
    smoothness = 1,
    includeStartingPoint = true,
    seasonId,
    comparison,
    expanded = false
}: { 
    data: RankingHistoryPoint[]; 
    playerName?: string; 
    curveType?: CurveType; // typ krzywej: 'linear', 'smooth', 'step', 'cardinal', 'monotone'
    smoothness?: number; // parametr gładkości (tylko dla 'smooth' i 'cardinal')
    includeStartingPoint?: boolean; // czy dodawać punkt startowy 2000
    seasonId: number;
    comparison?: { playerName: string; data: RankingHistoryPoint[] } | { playerName: string; data: RankingHistoryPoint[] }[];
    expanded?: boolean;
}) {
    const [hoveredPoint, setHoveredPoint] = useState<{ index: number; point: RankingHistoryPoint; mouseX: number; mouseY: number } | null>(null);
    const avatarClipId = useId().replace(/:/g, '');

    const comparisons = (Array.isArray(comparison) ? comparison : comparison ? [comparison] : []).filter(line => line.data.length > 0);
    const comparing = comparisons.length > 0;
    if (data.length === 0 && !comparing) return null;

    const sizeScale = expanded ? 2 : 1;
    const margin = { top: expanded ? 0 : 10, right: expanded ? 0 : 10, bottom: expanded ? 0 : 10, left: expanded ? 0 : 10 };
    const width = expanded ? 1200 : 300;
    const height = expanded ? 1680 : 150;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Przygotowanie danych - opcjonalnie dodajemy punkt startowy 2000
    const prepareData = (history: RankingHistoryPoint[]) => includeStartingPoint && history.length > 0 ? (() => {
        const startingPoint: RankingHistoryPoint = {
            score: 2000,
            date: new Date(Math.min(...history.map(d => d.date.getTime())) - 24 * 60 * 60 * 1000), // dzień przed pierwszym punktem
            reason: "Punkt startowy"
        };
        return [startingPoint, ...history];
    })() : history;
    const series = [
        { name: playerName, color: 'rgb(255, 255, 0)', data: prepareData(data) },
        ...comparisons.map((line, index) => ({ name: line.playerName, color: getRankingComparisonColor(index), data: prepareData(line.data) })),
    ];
    const allData = series.flatMap(line => line.data.map(point => ({ ...point, playerName: line.name, color: line.color })));
    const rankLabelWidth = expanded ? Math.max(...RANK_TIERS.map(tier => `${tier.name} ${tier.minRating}`.length * 5 * sizeScale + 20 * sizeScale)) : 0;
    const labelWidth = Math.max(rankLabelWidth, ...series.map(line => line.name ? line.name.length * 5 * sizeScale + 20 * sizeScale : 0));
    
    const minScore = Math.min(...allData.map(d => d.score));
    const maxScore = Math.max(...allData.map(d => d.score));
    const sortedRankThresholds = RANK_TIERS.map(tier => tier.minRating).sort((a, b) => a - b);
    const rankDomainMin = expanded
        ? [...sortedRankThresholds].reverse().find(threshold => threshold <= minScore) ?? minScore
        : minScore;
    const rankDomainMax = expanded
        ? sortedRankThresholds.find(threshold => threshold >= maxScore) ?? maxScore
        : maxScore;
    const rankPadding = expanded ? Math.max((rankDomainMax - rankDomainMin) * 0.05, 20) : 0;
    const flatScore = minScore === maxScore;
    const domainMin = expanded ? rankDomainMin - rankPadding : flatScore ? minScore - 50 : minScore;
    const domainMax = expanded ? rankDomainMax + rankPadding : flatScore ? maxScore + 50 : maxScore;
    const scoreRange = domainMax - domainMin || 1;
    const rankTicks = expanded
        ? RANK_TIERS.filter(tier => tier.minRating >= rankDomainMin && tier.minRating <= rankDomainMax)
            .sort((a, b) => a.minRating - b.minRating)
        : [];
    const rankBands = rankTicks.slice(0, -1).map((lower, index) => ({
        name: lower.name,
        midpoint: (lower.minRating + rankTicks[index + 1].minRating) / 2,
    }));

    // Funkcje skalowania - X bazuje na równomiernym rozmieszczeniu punktów
    // Both players share one slot per game. Real-time spacing squeezes an entire
    // evening into a vertical line when sessions are a week apart.
    const pointKey = (point: RankingHistoryPoint) => point.gameIdentifier
        ? `game:${point.gameIdentifier}`
        : point.gameId != null ? `game-id:${point.gameId}` : `date:${point.date.getTime()}:${point.reason ?? ''}`;
    const timeline = [...new Map(allData.map(point => [pointKey(point), point])).values()]
        .sort((a, b) => a.date.getTime() - b.date.getTime() || (a.gameId ?? 0) - (b.gameId ?? 0));
    const slotByKey = new Map(timeline.map((point, index) => [pointKey(point), index]));
    const scalePoint = (point: RankingHistoryPoint) =>
        ((slotByKey.get(pointKey(point)) ?? 0) / Math.max(1, timeline.length - 1)) * chartWidth;
    const scaleX = (index: number) => comparing ? scalePoint(allData[index]) : (index / Math.max(1, allData.length - 1)) * chartWidth;
    const scaleY = (score: number) => chartHeight - ((score - domainMin) / scoreRange) * chartHeight;

    // Generowanie różnych typów krzywych wykresu
    const generatePath = (points: { x: number; y: number }[], type: CurveType, curvature: number) => {
        if (points.length < 2) return '';
        
        switch (type) {
            case 'linear':
                // Proste linie między punktami
                let linearPath = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                    linearPath += ` L ${points[i].x} ${points[i].y}`;
                }
                return linearPath;
                
            case 'step':
                // Krzywa schodkowa (step function)
                let stepPath = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                    const curr = points[i];
                    stepPath += ` H ${curr.x} V ${curr.y}`;
                }
                return stepPath;
                
            case 'cardinal':
                // Cardinal spline - bardzo naturalne krzywe
                let cardinalPath = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                    const p0 = points[Math.max(i - 2, 0)];
                    const p1 = points[i - 1];
                    const p2 = points[i];
                    const p3 = points[Math.min(i + 1, points.length - 1)];
                    
                    const tension = curvature;
                    const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
                    const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
                    const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
                    const cp2y = p2.y - (p3.y - p1.y) * tension / 6;
                    
                    cardinalPath += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
                }
                return cardinalPath;
                
            case 'monotone':
                // Monotone cubic interpolation - zachowuje trendy wzrostu/spadku
                let monotonePath = `M ${points[0].x} ${points[0].y}`;
                const slopes = [];
                
                // Oblicz nachylenia
                for (let i = 0; i < points.length - 1; i++) {
                    slopes[i] = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);
                }
                
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    const dx = curr.x - prev.x;
                    
                    const m0 = i > 1 ? slopes[i - 2] : slopes[i - 1];
                    const m1 = i < points.length - 1 ? slopes[i - 1] : slopes[i - 2];
                    
                    const cp1x = prev.x + dx / 3;
                    const cp1y = prev.y + (dx * m0) / 3;
                    const cp2x = curr.x - dx / 3;
                    const cp2y = curr.y - (dx * m1) / 3;
                    
                    monotonePath += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
                }
                return monotonePath;
                
            case 'smooth':
            default:
                // Twoja poprzednia wersja z Bézier curves
                let smoothPath = `M ${points[0].x} ${points[0].y}`;
                
                for (let i = 1; i < points.length; i++) {
                    const current = points[i];
                    const previous = points[i - 1];
                    
                    if (i === 1) {
                        const controlX = previous.x + (current.x - previous.x) * (curvature + 0.1);
                        smoothPath += ` Q ${controlX} ${previous.y} ${current.x} ${current.y}`;
                    } else {
                        const prev2 = points[i - 2];
                        const next = i < points.length - 1 ? points[i + 1] : current;
                        
                        const cp1x = previous.x + (current.x - prev2.x) * curvature;
                        const cp1y = previous.y;
                        const cp2x = current.x - (next.x - previous.x) * curvature;
                        const cp2y = current.y;
                        
                        smoothPath += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${current.x} ${current.y}`;
                    }
                }
                return smoothPath;
        }
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
            window.open(buildSeasonUrl(`/historia-gier/${dateStr}/${point.gameIdentifier}`, seasonId), '_blank');
        }
    };

    const paths = series.map(line => ({
        ...line,
        path: generatePath(line.data.map((point, index) => ({
            x: comparing ? scalePoint(point) : scaleX(index),
            y: scaleY(point.score),
        })), comparing ? 'linear' : curveType, smoothness),
    }));

    // Formatowanie dat dla osi X
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit'
        }).format(date);
    };

    // Punkty na osi X (co kilka punktów dla czytelności)
    const axisData = comparing ? timeline : allData;
    const sampledAxisPoints = axisData.filter((_, index) =>
        index === 0 || 
        index === axisData.length - 1 ||
        index % Math.ceil(axisData.length / 5) === 0
    );
    const labelledDates = new Set<string>();
    const xAxisPoints = sampledAxisPoints.filter(point => {
        const label = formatDate(point.date);
        if (labelledDates.has(label)) return false;
        labelledDates.add(label);
        return true;
    });

    return (
        <div className={`w-full h-full flex ${expanded ? 'items-start' : 'items-center'} justify-center relative`}>
            <svg 
                viewBox={`${-labelWidth} 0 ${width + 2 * labelWidth} ${height}`}
                className={`text-white w-full h-full ${expanded ? 'max-w-none' : 'max-w-4xl'}`}
                preserveAspectRatio={expanded ? "xMidYMin meet" : "xMidYMid meet"}
            >
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Linie siatki */}
                    {(expanded ? rankTicks.map(tier => ({ score: tier.minRating, label: String(tier.minRating) })) : [0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const score = domainMax - ratio * scoreRange;
                        return { score, label: String(Math.round(score)) };
                    })).map(tick => (
                        <g key={tick.score}>
                            <line
                                x1={0}
                                y1={scaleY(tick.score)}
                                x2={chartWidth}
                                y2={scaleY(tick.score)}
                                stroke={expanded ? "rgb(156, 163, 175)" : "rgb(80, 80, 80)"}
                                strokeWidth={expanded ? 1.2 * sizeScale : 0.2 * sizeScale}
                                strokeDasharray="none"
                            />
                            <text
                                x={-7}
                                y={scaleY(tick.score) + 4 * sizeScale}
                                fill="rgb(161, 161, 170)"
                                fontSize={9 * sizeScale}
                                textAnchor="end"
                            >
                                {tick.label}
                            </text>
                        </g>
                    ))}

                    {rankBands.map(band => (
                        <text
                            key={band.name}
                            x={-7}
                            y={scaleY(band.midpoint) + 4 * sizeScale}
                            fill="rgb(161, 161, 170)"
                            fontSize={9 * sizeScale}
                            textAnchor="end"
                        >
                            {band.name}
                        </text>
                    ))}

                    {/* Oś X */}
                    <line
                        x1={0}
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={0.8 * sizeScale}
                    />

                    {/* Oś Y */}
                    <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={0.8 * sizeScale}
                    />

                    {/* Pionowe linie siatki */}
                    {xAxisPoints.map((point, _pointIndex) => {
                        const originalIndex = allData.findIndex(d => pointKey(d) === pointKey(point));
                        return (
                            <line
                                key={`grid-${pointKey(point)}`}
                                x1={scaleX(originalIndex)}
                                y1={0}
                                x2={scaleX(originalIndex)}
                                y2={chartHeight}
                                stroke="rgb(80, 80, 80)"
                                strokeWidth={0.2 * sizeScale}
                            />
                        );
                    })}

                    {/* Etykiety osi X */}
                    {xAxisPoints.map((point) => {
                        const originalIndex = allData.findIndex(d => pointKey(d) === pointKey(point));
                        return (
                            <text
                                key={pointKey(point)}
                                x={scaleX(originalIndex)}
                                y={chartHeight+10 * sizeScale}
                                fill="rgb(161, 161, 170)"
                                fontSize={6 * sizeScale}
                                textAnchor="middle"
                            >
                                {formatDate(point.date)}
                            </text>
                        );
                    })}

                    {/* Linia wykresu */}
                    {paths.map(line => <path
                        key={line.color}
                        d={line.path}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={2 * sizeScale}
                    />)}

                    {/* Punkty na wykresie */}
                    {allData.map((point, index) => {
                        const x = scaleX(index);
                        const y = scaleY(point.score);
                        const isHovered = hoveredPoint?.index === index;
                        const isLastPoint = Boolean(point.playerName) && allData[index + 1]?.color !== point.color;
                        
                        return (
                            <g key={index}>
                                {isLastPoint && point.playerName ? (
                                    <>
                                        <defs>
                                            <clipPath id={`${avatarClipId}-${index}`}>
                                                <circle cx={x} cy={y} r={6 * sizeScale} />
                                            </clipPath>
                                        </defs>
                                        <circle cx={x} cy={y} r={6.5 * sizeScale} fill="rgb(24, 24, 27)" stroke={point.color} strokeWidth={0.8 * sizeScale} />
                                        <image
                                            href={getPlayerAvatarPath(point.playerName)}
                                            x={x - 6 * sizeScale} y={y - 6 * sizeScale} width={12 * sizeScale} height={12 * sizeScale}
                                            clipPath={`url(#${avatarClipId}-${index})`}
                                            preserveAspectRatio="xMidYMid slice"
                                        />
                                        <text x={x + 10 * sizeScale} y={y} dominantBaseline="middle" fill={point.color} fontSize={8 * sizeScale} fontWeight="600">
                                            {point.playerName} ({Math.round(point.score)})
                                        </text>
                                    </>
                                ) : <circle
                                    cx={x}
                                    cy={y}
                                    r={isHovered ? 2.5 * sizeScale : 1.5 * sizeScale}
                                    fill="white"
                                    stroke={point.color}
                                    strokeWidth={isHovered ? sizeScale : 0.3 * sizeScale}
                                    className="transition-all duration-200"
                                />}
                                
                                {/* Niewidoczny większy obszar do hover i kliknięć */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={8 * sizeScale}
                                    fill="transparent"
                                    className={`${point.gameIdentifier ? 'cursor-pointer' : 'cursor-default'}`}
                                    onMouseEnter={(e) => {
                                        const containerRect = e.currentTarget.closest('div')?.getBoundingClientRect();
                                        if (containerRect) {
                                            const relativeX = e.clientX - containerRect.left;
                                            const relativeY = e.clientY - containerRect.top;
                                            setHoveredPoint({ 
                                                index, 
                                                mouseX: relativeX, 
                                                mouseY: relativeY, 
                                                point 
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    onClick={() => handlePointClick(point)}
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>
            
            {/* Stylizowany tooltip wzorowany na tooltipach z historii gier */}
            {hoveredPoint && (
                <div 
                    className="absolute pointer-events-none"
                    style={{
                        left: hoveredPoint.mouseX,
                        top: hoveredPoint.mouseY - 90, // 90px nad kursorem
                        transform: 'translateX(-50%)', // Wyśrodkowujemy poziomo
                        zIndex: 9999, // Bardzo wysoki z-index dla najwyższej warstwy
                    }}
                >
                    <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-600 shadow-lg">
                        <div className="font-medium">
                            {comparing && <div style={{ color: allData[hoveredPoint.index]?.color }}>{allData[hoveredPoint.index]?.playerName}</div>}
                            {formatDate(hoveredPoint.point.date)}: {Math.round(hoveredPoint.point.score)} punktów
                        </div>
                        {hoveredPoint.point.reason && (
                            <div className="text-gray-300 text-xs mt-1">
                                {hoveredPoint.point.reason}
                            </div>
                        )}
                        {hoveredPoint.point.gameIdentifier && (
                            <div className="text-blue-300 text-xs mt-1">
                                Kliknij aby zobaczyć grę
                            </div>
                        )}
                        {/* Strzałka wskazująca na punkt */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
