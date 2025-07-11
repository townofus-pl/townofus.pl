import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const SeerAbilities = {
    Reveal: {
        "name": "Reveal (Odkryj)",
        "icon": "/images/abilities/seer.png"
    },
};

export const Seer: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Seer",
    "id": "seer",
	"color": "#FFCC80",
    "team": Teams.Crewmate,
    "icon": "/images/roles/seer.png",
    "description": (
        <>
            <p>Crewmate, który może sprawdzić przynależność drużynową innego gracza. Po użyciu zdolności, nick sprawdzanego gracza zmienia kolor na <span style={{ color: "#00ff00" }}>Zielony</span> lub <span style={{ color: "#ff0000" }}>Czerwony</span>. Znaczenie tych kolorów jest zależne od ustawień.</p>
        </>
    ),


    "settings": {
        ...probabilityOfAppearing(0),
        "Seer Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Crewmate Killing Roles Are Red": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Neutral Benign Roles Are Red": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Neutral Evil Roles Are Red": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Neutral Killing Roles Are Red": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Traitor Does Not Swap Colours": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [SeerAbilities.Reveal],
};
