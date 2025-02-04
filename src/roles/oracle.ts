import {probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const OracleAbilities = {
    Confess: {
        "name": "Confess (Wyspowiadaj)",
        "icon": "/images/abilities/confess.png"
    },
};

export const Oracle: Role = {
    "name": "Oracle",
    "color": "#BF00BF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/oracle.png",
    "description": "Crewmate, który może zmusić innego gracza do wyjawienia informacji. <br>Oracle ma 3 zdolności: <br>Pierwsza - gdy Oracle zginie, osoba wyznająca mu informacje ujawni wszystkim swoją przynależność (80% szans na prawidłową). <br>Druga - podczas każdego spotkania Oracle otrzymuje wyznanie od spowiadanej osoby o tym, kto może być mordercą. Spowiadany zawsze wyjawia dwóch podejrzanych. Jeśli spowiadany jest Crewmatem, wydaje co najmniej jednego mordercę. W przeciwnym wypadku podejrzenia są fałszywe.<br>Trzecia - Oracle daje błogosławieństwo osobie spowiadanej, co zapewnia jej odporność na głosy.",
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
