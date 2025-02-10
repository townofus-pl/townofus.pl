import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const JailorAbilities = {
    Jail: {
        "name": "Jail (Zabierz do więzienia)",
        "icon": "/images/abilities/jail.png"
    },
    Execute: {
        "name": "Execute (Dokonaj Egzekucji)",
        "icon": "/images/abilities/execute.png"
    }
}

export const Jailor: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Jailor",
    "color": "#A5A5A5",
    "team": Teams.Crewmate,
    "icon": "/images/roles/jailor.png",
    "description": "Crewmate, który może uwięzić dowolnego gracza. Uwięziona osoba nie może rozmawiać z innymi graczami. Uwięziony nie może używać żadnych zdolności związanych ze spotkaniami, a żadne zdolności spotkaniowe nie mogą być użyte na niej. Jailor może prywatnie komunikować się z uwięzionym używając na czacie komendy /jail. Jeśli Jailor uzna, że uwięziony jest zły, może dokonać na nim egzekucji. Jeśli Jailor wykona egzekucję na niewłaściwej osobie, traci możliwość więzienia.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Jail Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Maximum Number Of Executes": {
            value: 3,
            type: SettingTypes.Number,
        }
    },
    "abilities": [
        JailorAbilities.Jail,
        JailorAbilities.Execute
    ],
    "tip": "Zawsze pytaj uwięzionego o jego rolę."
};
