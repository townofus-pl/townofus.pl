import type { Setting } from '@/constants/settings';

export type MiraSettingGroup = {
    name: string;
    id: string;
    cfgKey: string;
    settings: Record<string, Setting>;
};
