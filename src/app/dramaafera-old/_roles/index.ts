import { ModSettings } from "./mod_settings";
import { ImpostorSettings } from "./impostor_settings";
import { Roles as RolesBase } from "@/roles";

export const Roles = [
    ...RolesBase,
    ModSettings,
    ImpostorSettings,
].sort((a, b) => a.name.localeCompare(b.name));
