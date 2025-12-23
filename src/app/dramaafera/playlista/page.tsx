'use client';

import { useState } from 'react';
import { YouTubeEmbed } from '@/app/_components/YouTubeEmbed';

interface WeekData {
  id: string;
  title: string;
  videoId: string;
}

export default function PlaylistaPage() {
  // Dane wszystkich tygodni
  const weeks: WeekData[] = [
    { id: "s2week9", title: "S2 WEEK 9", videoId: "IqhiTqBG84c" },
    { id: "s2week8", title: "S2 WEEK 8", videoId: "UGRMOZnWX4I" },
    { id: "s2week7", title: "S2 WEEK 7", videoId: "OyWFxHnqmhk" },
    { id: "s2week4", title: "S2 WEEK 4", videoId: "GxnaDvf7zYI" },
    { id: "s2week1", title: "S2 WEEK 1", videoId: "tAXzHo24cBg" },
    { id: "week29", title: "S1 WEEK 29", videoId: "t2aUsnXL4ok" },
    { id: "week27", title: "S1 WEEK 27", videoId: "yFIAhC0WcJE" },
    { id: "week21", title: "S1 WEEK 21", videoId: "ibE4Ql6ShDU" },
    { id: "week20", title: "S1 WEEK 20", videoId: "-BOeA3D4Xtg" },
    { id: "week19", title: "S1 WEEK 19", videoId: "8qKUwso6Ruc" },
    { id: "week18", title: "S1 WEEK 18", videoId: "KDKBb4dcOsM" },
    { id: "week17", title: "S1 WEEK 17", videoId: "sGwCtfPY3JM" },
    { id: "week16", title: "S1 WEEK 16", videoId: "_YYblrMyDgo" },
    { id: "week15", title: "S1 WEEK 15", videoId: "OOcUHKPQoQM" },
    { id: "week14", title: "S1 WEEK 14", videoId: "ZJqbN2f6MEM" },
    { id: "week13", title: "S1 WEEK 13", videoId: "LiosBxvyTK8" },
    { id: "week12", title: "S1 WEEK 12", videoId: "ph4MRWhIP-I" },
    { id: "week11", title: "S1 WEEK 11", videoId: "J5cUtHbZzDo" },
    { id: "week10", title: "S1 WEEK 10", videoId: "lT6-ktFybVY" },
    { id: "week9", title: "S1 WEEK 9", videoId: "wHn8JTDBu8M" },
    { id: "week8", title: "S1 WEEK 8", videoId: "dHqWJdCIcts" },
    { id: "week7", title: "S1 WEEK 7", videoId: "r-TGZ8DAdvU" },
    { id: "week6", title: "S1 WEEK 6", videoId: "5GYZthg3k-s" },
    { id: "week4And5", title: "S1 WEEK 4 & 5", videoId: "4xhZFRJlXZc" },
  ];

  // Stan dla wybranego tygodnia (domyślnie najnowszy)
  const [selectedWeek, setSelectedWeek] = useState<WeekData>(weeks[0]);

  return (
    <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
            Playlista DramaAfera
          </h1>
          <p className="text-center text-gray-300 mt-4 text-lg">
            Playlista z filmami z Dramy Afery!
          </p>
        </div>


        {/* Wybrany film */}
        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            {selectedWeek.title}
          </h2>
          <div className="max-w-4xl mx-auto">
            <YouTubeEmbed 
              videoId={selectedWeek.videoId}
              title={`DramaAfera - ${selectedWeek.title}`}
            />
          </div>
        </div>

        {/* Lista wszystkich tygodni (opcjonalnie) */}
        <div className="mt-12 bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
            Wszystkie dostępne tygodnie
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {weeks.map((week) => (
              <button
                key={week.id}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedWeek.id === week.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {week.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
