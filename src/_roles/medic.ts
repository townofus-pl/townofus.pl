import {probabilityOfAppearing, Role, RoleSettingTypes, Teams} from "./shared";

export const MedicAbilities = {
    Shield: {
        "name": "Shield (Osłoń)",
        "icon": "/images/abilities/Medic.png"
    }
}

export const Medic: Role = {
    "name": "Medic",
    "color": "#006400",
    "team": Teams.Crewmate,
    "icon": "/images/roles/medic.png",
    "description": "Medic to Crewmate, który może dać dowolnemu graczowi tarczę czyniącą go nieśmiertelnym. Tarcza znika tylko w momencie śmierci Medica. Osoba z tarczą nie może zostać zabita przez nikogo, ale może popełnić samobójstwo. Medic widzi zieloną poświatę na ekranie, jeśli ktoś spróbuje zabić jego podopiecznego. Jeśli Medic zgłosi martwe ciało odpowiednio szybko, może otrzymać raport zawierający wskazówki na temat tożsamości Zabójcy. Raport będzie zawierać typ koloru (Darker/Lighter).",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Show Shielded Player": {
            value: "Self+Medic",
            type: RoleSettingTypes.Text
        },
        "Who Gets Murder Attempt Indicator": {
            value: 'Medic',
            type: RoleSettingTypes.Text
        },
        "Shield Breaks On Murder Attempt": {
            value: false,
            type: RoleSettingTypes.Boolean,
        },
        "Show Medic Reports": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
        "Time Where Medic Will Have Name": {
            value: 0,
            type: RoleSettingTypes.Time,
        },
        "Time Where Medic Will Have Color Type": {
            value: 15,
            type: RoleSettingTypes.Time,
        },
    },
    "abilities": [MedicAbilities.Shield],
    "tip": "Gdy dajesz komuś tarczę, postaraj się to zrobić tak, żeby gracz wiedział że to ty mu ją wręczyłeś."
}
