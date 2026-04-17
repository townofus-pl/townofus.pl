import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraForensicAbilities = {
    Inspect: {
        name: 'Inspect (Zbadaj)',
        icon: '/images/mira/abilities/InspectButton.png',
    },
    Examine: {
        name: 'Examine (Sprawdź)',
        icon: '/images/mira/abilities/ExamineButton.png',
    },
};

export const MiraForensic: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Forensic',
    id: 'mira_forensic',
    color: '#4D4DFF',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Forensic.png',
    description: 'Forensic może zbadać miejsce zbrodni i następnie sprawdzać graczy, aby ustalić, czy byli w pobliżu tego miejsca. Podczas sprawdzania gracza ekran miga na czerwono, jeśli ten gracz był blisko zbadanego miejsca zbrodni.',
    settings: {
        ...probabilityOfAppearing(0),
        'Examine Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Show Forensic Reports': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Time Where Forensic Will Have Faction': {
            value: 30,
            type: SettingTypes.Time,
        },
        'Time Where Forensic Will Have Role': {
            value: 7.5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraForensicAbilities.Inspect, MiraForensicAbilities.Examine],
    tip: 'Najbardziej wiarygodne tropy dostaniesz ze zbrodni w miejscach o małym ruchu; popularne lokacje częściej mieszają ślady niewinnych.',
};
