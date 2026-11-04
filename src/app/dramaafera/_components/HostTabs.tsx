'use client';

import { useState } from 'react';
import HostClient from './HostClient';
import RoleRankingTable from './RoleRankingTable';
import RoleProbabilities from './RoleProbabilities';
import type { RoleProbabilityData } from '../_utils/roleProbabilities';
import RoleBalanceReviews from './RoleBalanceReviews';
import ListaCweliTab from './ListaCweliTab';
import { SettingsTab } from './SettingsTab';
import type { GameDateEntry } from '@/app/dramaafera/_services';
import type { RoleRankingStats } from '@/app/dramaafera/_services';

// Tab constants
const TAB_HOST = 'host';
const TAB_ROLES = 'role';
const TAB_LIST = 'lista';
const TAB_SETTINGS = 'ustawienia';

type HostTabId = typeof TAB_HOST | typeof TAB_ROLES | typeof TAB_LIST | typeof TAB_SETTINGS;

const TABS: ReadonlyArray<{ id: HostTabId; label: string }> = [
  { id: TAB_HOST, label: 'Host' },
  { id: TAB_ROLES, label: 'Role' },
  { id: TAB_LIST, label: 'Lista Cweli' },
  { id: TAB_SETTINGS, label: 'Ustawienia' },
];

interface HostTabsProps {
  initialDates: GameDateEntry[];
  seasonId: number;
  roles: RoleRankingStats[];
  probabilities: RoleProbabilityData;
}

export default function HostTabs({ initialDates, seasonId, roles, probabilities }: HostTabsProps) {
  const [roleView, setRoleView] = useState<'reviews' | 'stats' | 'probabilities'>('reviews');
  const [activeTab, setActiveTab] = useState<HostTabId>(TAB_HOST);
  const [settingsVisited, setSettingsVisited] = useState(false);

  const getTabContent = () => {
    switch (activeTab) {
      case TAB_HOST:
        return <HostClient initialDates={initialDates} seasonId={seasonId} />;
      case TAB_ROLES:
        return <div>
          <div className="mb-4 flex flex-wrap gap-3" aria-label="Widok ról">
            <button type="button" aria-pressed={roleView === 'reviews'} onClick={() => setRoleView('reviews')} className={roleView === 'reviews' ? 'rounded-lg bg-blue-600 px-4 py-2 text-white' : 'rounded-lg bg-zinc-800 px-4 py-2 text-gray-300'}>Przeglądy balansu</button>
            <button type="button" aria-pressed={roleView === 'stats'} onClick={() => setRoleView('stats')} className={roleView === 'stats' ? 'rounded-lg bg-blue-600 px-4 py-2 text-white' : 'rounded-lg bg-zinc-800 px-4 py-2 text-gray-300'}>Statystyki ról</button>
            <button type="button" aria-pressed={roleView === 'probabilities'} onClick={() => setRoleView('probabilities')} className={roleView === 'probabilities' ? 'rounded-lg bg-blue-600 px-4 py-2 text-white' : 'rounded-lg bg-zinc-800 px-4 py-2 text-gray-300'}>Prawdopodobieństwo wystąpień</button>
          </div>
          {roleView === 'reviews' ? <RoleBalanceReviews seasonId={seasonId} /> : roleView === 'probabilities' ? <RoleProbabilities data={probabilities} seasonId={seasonId} /> : <RoleRankingTable roles={roles} seasonId={seasonId} excludeLatestDay={false} showBalance />}
        </div>;
      case TAB_LIST:
        return <ListaCweliTab seasonId={seasonId} />;
      case TAB_SETTINGS:
        return <SettingsTab />;
      default: {
        const _exhaustive: never = activeTab;
        return _exhaustive;
      }
    }
  };

  return (
    <div>
      {/* Karty nagłówkowe */}
      <div className="flex gap-4 mb-6 border-b border-gray-700 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === TAB_SETTINGS) setSettingsVisited(true);
            }}
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
      <div>{activeTab !== TAB_SETTINGS && getTabContent()}</div>
      {/* Keep an in-progress preset when the host switches to another panel tab. */}
      <div hidden={activeTab !== TAB_SETTINGS}>{settingsVisited && <SettingsTab />}</div>
    </div>
  );
}
