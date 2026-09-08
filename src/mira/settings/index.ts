export type { MiraSettingGroup } from './types';

import { MiraHostSpecificOptions } from './hostSpecificOptions';
import { MiraVanillaTweaks } from './vanillaTweaks';
import { MiraRoleblockMechanics } from './roleblockMechanics';
import { MiraGameMechanics } from './gameMechanics';
import { MiraRoundStartOptions } from './roundStartOptions';
import { MiraGeneral } from './general';
import { MiraRoleSettings } from './roleSettings';
import { MiraRoleListSettings } from './roleListSettings';
import { MiraPostmortemOptions } from './postmortemOptions';
import { MiraRandomMapChoice } from './randomMapChoice';
import { MiraGlobalBetterMaps } from './globalBetterMaps';
import { MiraRandomizedDoorMode } from './randomizedDoorMode';
import { MiraAdvancedSabotages } from './advancedSabotages';
import { MiraAdvancedUtilities } from './advancedUtilities';
import { MiraBetterSkeld } from './betterSkeld';
import { MiraBetterMiraHq } from './betterMiraHq';
import { MiraBetterPolus } from './betterPolus';
import { MiraBetterAirship } from './betterAirship';
import { MiraBetterFungle } from './betterFungle';
import { MiraImpostorSettings } from './impostorSettings';
import { MiraCrewmateSettings } from './crewmateSettings';
import { MiraNeutralSettings } from './neutralSettings';

export {
    MiraHostSpecificOptions,
    MiraVanillaTweaks,
    MiraRoleblockMechanics,
    MiraGameMechanics,
    MiraRoundStartOptions,
    MiraGeneral,
    MiraRoleSettings,
    MiraRoleListSettings,
    MiraPostmortemOptions,
    MiraRandomMapChoice,
    MiraGlobalBetterMaps,
    MiraRandomizedDoorMode,
    MiraAdvancedSabotages,
    MiraAdvancedUtilities,
    MiraBetterSkeld,
    MiraBetterMiraHq,
    MiraBetterPolus,
    MiraBetterAirship,
    MiraBetterFungle,
    MiraImpostorSettings,
    MiraCrewmateSettings,
    MiraNeutralSettings,
};

export const MiraSettings = [
    MiraHostSpecificOptions,
    MiraVanillaTweaks,
    MiraRoleblockMechanics,
    MiraGameMechanics,
    MiraRoundStartOptions,
    MiraGeneral,
    MiraRoleSettings,
    MiraRoleListSettings,
    MiraPostmortemOptions,
    MiraRandomMapChoice,
    MiraGlobalBetterMaps,
    MiraRandomizedDoorMode,
    MiraAdvancedSabotages,
    MiraAdvancedUtilities,
    MiraBetterSkeld,
    MiraBetterMiraHq,
    MiraBetterPolus,
    MiraBetterAirship,
    MiraBetterFungle,
    MiraImpostorSettings,
    MiraCrewmateSettings,
    MiraNeutralSettings,
] as const;
