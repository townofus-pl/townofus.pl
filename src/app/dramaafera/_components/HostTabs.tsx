'use client';

import { useState } from 'react';
import HostClient from './HostClient';
import RoleRankingTable from './RoleRankingTable';
import type { GameDateEntry } from '@/app/dramaafera/_services';
import type { RoleRankingStats } from '@/app/dramaafera/_services';

interface HostTabsProps {
  initialDates: GameDateEntry[];
  seasonId: number;
  roles: RoleRankingStats[];
}

export default function HostTabs({ initialDates, seasonId, roles }: HostTabsProps) {
  const [activeTab, setActiveTab] = useState<'host' | 'role'>('host');

  return (
    <div>
      {/* Karty nagłówkowe */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('host')}
          className={`px-6 py-3 font-semibold text-lg transition-all ${
            activeTab === 'host'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Host
        </button>
        <button
          onClick={() => setActiveTab('role')}
          className={`px-6 py-3 font-semibold text-lg transition-all ${
            activeTab === 'role'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Role
        </button>
      </div>

      {/* Zawartość kart */}
      <div>
        {activeTab === 'host' && <HostClient initialDates={initialDates} seasonId={seasonId} />}
        {activeTab === 'role' && <RoleRankingTable roles={roles} seasonId={seasonId} />}
      </div>
    </div>
  );
}
