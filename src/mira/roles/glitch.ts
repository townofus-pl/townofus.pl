import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraGlitchAbilities = {
    Mimic: {
        name: 'Mimic (Naśladuj)',
        icon: '/images/mira/abilities/MimicButton.png',
    },
    Hack: {
        name: 'Hack (Hackuj)',
        icon: '/images/mira/abilities/HackButton.png',
    },
    Vent: {
        name: 'Vent (Wejdź do wentylacji)',
        icon: '/images/mira/abilities/GlitchVentButton.png',
    },
    Kill: {
        name: 'Kill (Zabij)',
        icon: '/images/mira/abilities/GlitchKillButton.png',
    },
};

export const MiraGlitch: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Glitch',
    id: 'mira_glitch',
    color: '#00FF00',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Glitch.png',
    description: 'Glitch wygrywa jako ostatni zabójca. Może naśladować wygląd innych oraz hackować graczy, co uniemożliwia zhakowanemu graczowi jakąkolwiek akcję poza chodzeniem po mapie',
    settings: {
        ...probabilityOfAppearing(0),
        'Kill Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Mimic Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Mimic Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Move While Using Mimic Menu (Keyboard Only)': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Hack Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Hack Duration': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Glitch Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraGlitchAbilities.Kill, MiraGlitchAbilities.Vent, MiraGlitchAbilities.Mimic, MiraGlitchAbilities.Hack],
};

