'use client';

import { useState } from 'react';
import HostClient from './HostClient';
import HostRolePanels from './HostRolePanels';
import ListaCweliTab from './ListaCweliTab';
import { SettingsTab } from './SettingsTab';
import DiscordMaterialsTab from '../host/_components/DiscordMaterialsTab';
import type { GameDateEntry } from '@/app/dramaafera/_services';

// Tab constants
const TAB_HOST = 'host';
const TAB_ROLES = 'role';
const TAB_LIST = 'lista';
const TAB_SETTINGS = 'ustawienia';
const TAB_DISCORD = 'discord';

type HostTabId = typeof TAB_HOST | typeof TAB_ROLES | typeof TAB_LIST | typeof TAB_SETTINGS | typeof TAB_DISCORD;

const TABS: ReadonlyArray<{ id: HostTabId; label: string }> = [
  { id: TAB_HOST, label: 'Host' },
  { id: TAB_ROLES, label: 'Role' },
  { id: TAB_LIST, label: 'Lista Cweli' },
  { id: TAB_SETTINGS, label: 'Ustawienia' },
  { id: TAB_DISCORD, label: 'Materiały na Discorda' },
];

interface HostTabsProps {
  initialDates: GameDateEntry[];
  seasonId: number;
}

export default function HostTabs({ initialDates, seasonId }: HostTabsProps) {
  const [activeTab, setActiveTab] = useState<HostTabId>(TAB_HOST);
  const [rolesVisited, setRolesVisited] = useState(false);
  const [settingsVisited, setSettingsVisited] = useState(false);

  const getTabContent = () => {
    switch (activeTab) {
      case TAB_HOST:
        return <HostClient initialDates={initialDates} seasonId={seasonId} />;
      case TAB_ROLES:
        return null;
      case TAB_LIST:
        return <ListaCweliTab seasonId={seasonId} />;
      case TAB_SETTINGS:
        return null;
      case TAB_DISCORD:
        return <DiscordMaterialsTab />;
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
              if (tab.id === TAB_ROLES) setRolesVisited(true);
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
      <div>{getTabContent()}</div>
      <div hidden={activeTab !== TAB_ROLES}>{rolesVisited && <HostRolePanels seasonId={seasonId} />}</div>
      {/* Keep an in-progress preset when the host switches to another panel tab. */}
      <div hidden={activeTab !== TAB_SETTINGS}>{settingsVisited && <SettingsTab />}</div>
    </div>
  );
}
