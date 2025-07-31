import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const OracleAbilities = {
    Confess: {
        "name": "Confess (Wyspowiadaj)",
        "icon": "/images/abilities/confess.png"
    },
    Bless: {
        "name": "Bless (Błogosław)",
        "icon": "/images/abilities/bless.png"
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
        <p>Crewmate, który może zmusić innego gracza do wyjawienia informacji. Oracle ma 2 zdolności:</p>
        <ul className="list-disc list-inside">
            <li>Spowiedź - Podczas każdego spotkania Oracle otrzymuje wyznanie od spowiadanej osoby o tym, kto może być mordercą. Spowiadany zawsze wyjawia trzech podejrzanych: siebie, oraz dwóch dodatkowych. Wśród tej trójki zawsze jest morderca. Gdy Oracle zginie, osoba wyznająca mu informacje ujawni wszystkim swoją przynależność (z określoną dokładnością).</li>
            <li>Błogosławieństwo - Sprawia, że pobłogosławiony gracz nie może zostać zabity na spotkaniu.</li>
        </ul>
    </>),
    "settings": {
        ...probabilityOfAppearing(0),
        "Confess Cooldown": {
            value: 25,
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
    "abilities": [OracleAbilities.Confess, OracleAbilities.Bless],
};
