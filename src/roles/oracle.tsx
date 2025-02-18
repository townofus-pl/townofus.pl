import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const OracleAbilities = {
    Confess: {
        "name": "Confess (Wyspowiadaj)",
        "icon": "/images/abilities/confess.png"
    },
};

export const Oracle: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Oracle",
    "id": "oracle",
	"color": "#BF00BF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/oracle.png",
    "description": (<>
        <p>Crewmate, który może zmusić innego gracza do wyjawienia informacji. Oracle ma 3 zdolności:</p>
        <ul className="list-disc list-inside">
            <li>Gdy Oracle zginie, osoba wyznająca mu informacje ujawni wszystkim swoją przynależność (80% szans na prawidłową).</li>
            <li>Podczas każdego spotkania Oracle otrzymuje wyznanie od spowiadanej osoby o tym, kto może być mordercą. Spowiadany zawsze wyjawia dwóch podejrzanych. Jeśli spowiadany jest Crewmatem, wydaje co najmniej jednego mordercę. W przeciwnym wypadku podejrzenia są fałszywe.</li>
            <li>Oracle daje błogosławieństwo osobie spowiadanej, co zapewnia jej odporność na głosy.</li>
        </ul>
    </>),
    "settings": {
        ...probabilityOfAppearing(-1),
        "Confess Cooldown": {
            value: 15,
            type: SettingTypes.Time,
        },
        "Reveal Accuracy": {
            value: 80,
            type: SettingTypes.Percentage,
        },
        "Neutral Benign Roles Show Evil": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Neutral Evil Roles Show Evil": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Neutral Killing Roles Show Evil": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [OracleAbilities.Confess],
};
