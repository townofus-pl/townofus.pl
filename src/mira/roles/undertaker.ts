import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import { MiraCommonAbilities } from '../abilities';

export const MiraUndertakerAbilities = {
    Drag: {
        name: 'Drag (Przeciągnij)',
        icon: '/images/mira/abilities/DragButton.png',
    },
    Drop: {
        name: 'Drop (Upuść)',
        icon: '/images/mira/abilities/DropButton.png',
    },
};

export const MiraUndertaker: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Support,
    name: 'Undertaker',
    id: 'mira_undertaker',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Undertaker.png',
    description: 'Undertaker może przeciągać martwe ciała po mapie i upuszczać je gdzie indziej, aby utrudnić ich zgłoszenie.',
    settings: {
        ...probabilityOfAppearing(0),
        'Drag Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Drag Speed': {
            value: 0.75,
            type: SettingTypes.Multiplier,
        },
        'Dragging Speed is Affected by Body Size': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Undertaker Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Can Vent With Body': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Undertaker Can Kill With Teammate': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraUndertakerAbilities.Drag, MiraUndertakerAbilities.Drop],
};
