import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const TrapperAbilities = {
    Trap: {
        "name": "Trap (Zastaw pułapkę)",
        "icon": "/images/abilities/trap.png"
    },
};

export const Trapper: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Trapper",
    "id": "trapper",
	"color": "#A5D1B2",
    "team": Teams.Crewmate,
    "icon": "/images/roles/trapper.png",
    "description": "Crewmate, który może ustawiać pułapki na mapie. Kiedy conajmniej 3 graczy (razem lub osobno) znajdzie się wewnątrz pułapki przez minimum 1 sekundę, aktywują ją. Podczas następnego spotkania, role graczy którzy aktywowali pułapkę zostaną ujawnione Trapperowi. Jednak robi się to w losowej kolejności, bez wskazywania, kto wszedł w pułapkę i bez ujawniania, jaka rola należy do konkretnego gracza.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Min Amount Of Time In Trap To Register": {
            value: 1,
            type: SettingTypes.Time,
        },
        "Trap Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Traps Removed After Each Round": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Maximum Number Of Traps": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Trap Size": {
            value: 0.25,
            type: SettingTypes.Multiplier,
        },
        "Minimum Number Of Roles Required To Trigger Trap": {
            value: 3,
            type: SettingTypes.Number,
        },
    },
    "abilities": [TrapperAbilities.Trap],
};
