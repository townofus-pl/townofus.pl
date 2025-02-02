import type {Teams} from "./teams";
import type {RoleSetting} from "./settings";
import type {RoleAbility} from "./abilities";

export type Role = {
    name: string;
    color: string;
    team: Teams;
    icon: string;
    description: string;
    settings: Record<string, RoleSetting>;
    abilities: RoleAbility[];
    tip?: string;
}