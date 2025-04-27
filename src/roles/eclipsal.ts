import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const EclipsalAbilities = {
    Blind: {
        "name": "Blind (Oślep)",
        "icon": "/images/abilities/blind.png"
    },
};

export const Eclipsal: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Eclipsal",
    "id": "eclipsal",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/placeholder.png",
    "description": "Impostor, który może oślepiać innych graczy. Umiejętność to obszarowe oślepienie, które powoduje, że wszyscy gracze w zasięgu stopniowo tracą widoczność. Efekt trwa określony czas. Gdy wizja wraca, następuje to w podobny sposób - od braku widoczności do pełnej wizji. Gracze oślepieni nie widzą też przycisku reportowania.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Blind Cooldown": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Blind Duration": {
            value: 25.0,
            type: SettingTypes.Time,
        },
        "Blind Radius": {
            value: 1,
            type: SettingTypes.Multiplier,
        },

    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, EclipsalAbilities.Blind],
};
