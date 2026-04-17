import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraArsonistAbilities = {
    Douse: {
        name: 'Douse (Polej)',
        icon: '/images/mira/abilities/DouseButton.png',
    },
    Ignite: {
        name: 'Ignite (Podpal)',
        icon: '/images/mira/abilities/IgniteButton.png',
    },
    Vent: {
        name: 'Vent (Wejdź do wentylacji)',
        icon: '/images/mira/abilities/ArsoVentButton.png',
    },
};

export const MiraArsonist: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Arsonist',
    id: 'mira_arsonist',
    color: '#FF4D00',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Arsonist.png',
    "description": (<>
        <p>Arsonist wygrywa jako ostatni zabójca. Ma dwie zdolności:</p>
        <ul className="list-disc list-inside">
            <li>Polewanie innych graczy benzyną,</li>
            <li>Zapalanie polanych graczy w pobliżu (Legacy mode: zapala wszystkich polanych graczy podchodząc do dowolnego polanego).</li>
        </ul>
        </>),    
        settings: {
        ...probabilityOfAppearing(0),
        'Douse Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Douse From Interactions': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Legacy Mode (No Radius)': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Arsonist Can Vent': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraArsonistAbilities.Vent, MiraArsonistAbilities.Douse, MiraArsonistAbilities.Ignite],
};

