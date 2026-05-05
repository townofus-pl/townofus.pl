'use client';

import { useState } from 'react';
import HostClient from './HostClient';
import RoleRankingTable from './RoleRankingTable';
import ListaCweliTab from './ListaCweliTab';
import type { GameDateEntry } from '@/app/dramaafera/_services';
import type { RoleRankingStats } from '@/app/dramaafera/_services';

interface HostTabsProps {
  initialDates: GameDateEntry[];
  seasonId: number;
  roles: RoleRankingStats[];
  availableAvatars: string[];
}

export default function HostTabs({ initialDates, seasonId, roles, availableAvatars }: HostTabsProps) {
  const [activeTab, setActiveTab] = useState<'host' | 'role' | 'lista'>('host');

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
        <button
          onClick={() => setActiveTab('lista')}
          className={`px-6 py-3 font-semibold text-lg transition-all ${
            activeTab === 'lista'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Lista Cweli
        </button>
      </div>

      {/* Zawartość kart */}
      <div>
        {activeTab === 'host' && <HostClient initialDates={initialDates} seasonId={seasonId} />}
        {activeTab === 'role' && <RoleRankingTable roles={roles} seasonId={seasonId} />}
        {activeTab === 'lista' && <ListaCweliTab seasonId={seasonId} availableAvatars={availableAvatars} />}
      </div>
    </div>
  );
}
