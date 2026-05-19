'use client';

import { useState } from 'react';
import HostClient from './HostClient';
import RoleRankingTable from './RoleRankingTable';
import ListaCweliTab from './ListaCweliTab';
import { SettingsTab } from './SettingsTab';
import type { GameDateEntry } from '@/app/dramaafera/_services';
import type { RoleRankingStats } from '@/app/dramaafera/_services';

// Tab constants
const TAB_HOST = 'host';
const TAB_ROLES = 'role';
const TAB_LIST = 'lista';
const TAB_SETTINGS = 'ustawienia';

type SettingsTabs = typeof TAB_HOST | typeof TAB_ROLES | typeof TAB_LIST | typeof TAB_SETTINGS;

interface HostTabsProps {
  initialDates: GameDateEntry[];
  seasonId: number;
  roles: RoleRankingStats[];
  availableAvatars: string[];
}

export default function HostTabs({ initialDates, seasonId, roles, availableAvatars }: HostTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabs>(TAB_HOST);

  const getTabContent = () => {
    switch (activeTab) {
      case TAB_HOST:
        return <HostClient initialDates={initialDates} seasonId={seasonId} />;
      case TAB_ROLES:
        return <RoleRankingTable roles={roles} seasonId={seasonId} />;
      case TAB_LIST:
        return <ListaCweliTab seasonId={seasonId} availableAvatars={availableAvatars} />;
      case TAB_SETTINGS:
        return <SettingsTab />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: TAB_HOST, label: 'Host' },
    { id: TAB_ROLES, label: 'Role' },
    { id: TAB_LIST, label: 'Lista Cweli' },
    { id: TAB_SETTINGS, label: 'Ustawienia' },
  ];

  return (
    <div>
      {/* Karty nagłówkowe */}
      <div className="flex gap-4 mb-6 border-b border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTabs)}
            className={`px-6 py-3 font-semibold text-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Zawartość kart */}
      <div>{getTabContent()}</div>
    </div>
  );
}
