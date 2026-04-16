import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraHerbalistAbilities = {
    Expose: {
        name: 'Expose (Ujawnij)',
        icon: '/images/mira/abilities/HerbExposeButton.png',
    },
    Confuse: {
        name: 'Confuse (Zdezorientuj)',
        icon: '/images/mira/abilities/HerbConfuseButton.png',
    },
    Protect: {
        name: 'Protect (Chroń)',
        icon: '/images/mira/abilities/HerbProtectButton.png',
    },
};

export const MiraHerbalist: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Herbalist',
    id: 'mira_herbalist',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Herbalist.png',
    description: (<>
        <p>Herbalist używa ziół, aby ujawniać, dezorientować lub chronić graczy. Wszystkie trzy działania korzystają ze wspólnego cooldownu.</p>
        <ul className="list-disc list-inside">
            <li>Expose ujawnia rolę wybranego gracza wszystkim Impostorom i blokuje możliwość zgadywania.</li>
            <li>Confuse otacza gracza zarodnikami, przez co nie może identyfikować innych graczy.</li>
            <li>Protect chroni gracza tymczasowo tak jak Cleric, również przed innymi Impostorami.</li>
        </ul>
    </>),
    settings: {
        ...probabilityOfAppearing(0),
        'Herb Cooldown': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Max Exposes Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Max Confuse Uses': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Max Protect Uses': {
            value: 7,
            type: SettingTypes.Number,
        },
        'Confuse Delay': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Confuse Duration': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Protect Duration': {
            value: 15,
            type: SettingTypes.Time,
        },
        'Protected Player Sees Barrier': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Notify Herablist Upon Attack': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraHerbalistAbilities.Expose, MiraHerbalistAbilities.Confuse, MiraHerbalistAbilities.Protect],
};