import type {Role} from "@/constants/rolesAndModifiers";
import {Glitch as GlitchBase, GlitchSettings} from "@/roles/glitch";
import {SettingTypes} from "@/constants/settings";

export const Glitch: Role = {
    ...GlitchBase,
    settings: {
        ...GlitchSettings,
        "Mimic Cooldown": {
            value: 20.0,
            type: SettingTypes.Time,
        },
    }
};
