import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const VampireAbilities = {
    Bite: {
        "name": "Bite (Ugryź)",
        "icon": "/images/abilities/bite.png"
    },
};

export const Vampire: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Vampire",
    "id": "vampire",
	"color": "#747474",
    "team": Teams.Neutral,
    "icon": "/images/roles/vampire.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Vampire może konwertować lub zabijać innych graczy poprzez ugryzienie. Jeżeli w grze jest jeden żywy wampir, ugryzienie Crewmate zamieni go w drugiego vampira. Jeżeli w grze jest dwóch wampirów lub cel nie jest Crewmate'em, ugryziony umrze.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Vampire Bite Cooldown": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Vampires Have Impostor Vision": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Vampires Can Vent": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "New Vampire Can Assassinate": {
            value: false,
            type: SettingTypes.Boolean  ,
        },
        "Maximum Vampires Per Game": {
            value: 2,
            type: SettingTypes.Number,
        },
        "Can Convert Neutral Benign Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Can Convert Neutral Evil Roles": {
            value: false,
            type: SettingTypes.Boolean,
                },
    },
    "abilities": [VampireAbilities.Bite],
};
