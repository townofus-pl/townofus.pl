import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const GrenadierAbilities = {
    Flash: {
        "name": "Flash (Oślep)",
        "icon": "/images/abilities/flash.png"
    }
};

export const Grenadier: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Grenadier",
    "id": "grenadier",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/grenadier.png",
    "description": "Impostor, który może rzucać granatami dymnymi. Podczas gry Grenadier może rzucić granat dymny, który oślepia Crewmate’ów, sprawiając, że ich ekran staje się jasnoszary. Granat dymny nie może być aktywowany w czasie sabotażu.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Flash Grenade Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Flash Grenade Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Flash Radius": {
            value: 1,
            type: SettingTypes.Multiplier,
        },
        "Indicate Flashed Crewmates": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Grenadier Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Sabotage, GrenadierAbilities.Flash],
};
