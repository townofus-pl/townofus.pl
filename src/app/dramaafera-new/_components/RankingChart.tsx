"use client";

import { useState } from "react";
import type { RankingHistoryPoint } from "../_services/gameDataService";

// Typy krzywych dostępne w wykresie
type CurveType = 'linear' | 'smooth' | 'step' | 'cardinal' | 'monotone';

// Komponent wykresu rankingu
export function RankingChart({ 
    data, 
    playerName, 
    curveType = 'cardinal',
    smoothness = 1
}: { 
    data: RankingHistoryPoint[]; 
    playerName?: string; 
    curveType?: CurveType; // typ krzywej: 'linear', 'smooth', 'step', 'cardinal', 'monotone'
    smoothness?: number; // parametr gładkości (tylko dla 'smooth' i 'cardinal')
}) {
    if (data.length === 0) return null;

    const [hoveredPoint, setHoveredPoint] = useState<{ index: number; point: RankingHistoryPoint; mouseX: number; mouseY: number } | null>(null);

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 300; // Będziemy używać viewBox dla responsywności
    const height = 150;  // Relatywne proporcje
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Przygotowanie danych - dodajemy punkt startowy 2000
    const startingPoint: RankingHistoryPoint = {
        score: 2000,
        date: new Date(Math.min(...data.map(d => d.date.getTime())) - 24 * 60 * 60 * 1000), // dzień przed pierwszym punktem
        reason: "Punkt startowy"
    };
    
    const allData = [startingPoint, ...data];
    const minScore = Math.min(2000, Math.min(...data.map(d => d.score)));
    const maxScore = Math.max(2000, Math.max(...data.map(d => d.score)));
    const scoreRange = maxScore - minScore || 1;

    // Funkcje skalowania - X bazuje na równomiernym rozmieszczeniu punktów
    const scaleX = (index: number) => (index / (allData.length - 1)) * chartWidth;
    const scaleY = (score: number) => chartHeight - ((score - minScore) / scoreRange) * chartHeight;

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
                    const prev = points[i - 1];
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
            window.open(`/dramaafera-new/historia-gier/${dateStr}/${point.gameIdentifier}`, '_blank');
        }
    };

    const chartPoints = allData.map((point, index) => ({
        x: scaleX(index),
        y: scaleY(point.score)
    }));
    
    const pathData = generatePath(chartPoints, curveType, smoothness);

    // Formatowanie dat dla osi X
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit'
        }).format(date);
    };

    // Punkty na osi X (co kilka punktów dla czytelności)
    const xAxisPoints = allData.filter((_, index) => 
        index === 0 || 
        index === allData.length - 1 || 
        index % Math.ceil(allData.length / 5) === 0
    );

    return (
        <div className="w-full h-full flex items-center justify-center relative">
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
                                x={-7}
                                y={chartHeight * ratio + 4}
                                fill="rgb(161, 161, 170)"
                                fontSize="9"
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
                    {xAxisPoints.map((point, pointIndex) => {
                        const originalIndex = allData.findIndex(d => d.date.getTime() === point.date.getTime());
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
                        const originalIndex = allData.findIndex(d => d.date.getTime() === point.date.getTime());
                        return (
                            <text
                                key={point.date.getTime()}
                                x={scaleX(originalIndex)}
                                y={chartHeight+10}
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
                    {allData.map((point, index) => {
                        const x = scaleX(index);
                        const y = scaleY(point.score);
                        const isHovered = hoveredPoint?.index === index;
                        
                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isHovered ? 2.5 : 1.5}
                                    fill="white"
                                    stroke="rgb(255, 255, 0)"
                                    strokeWidth={isHovered ? 1 : 0.3}
                                    className="transition-all duration-200"
                                />
                                
                                {/* Niewidoczny większy obszar do hover i kliknięć */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={8}
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