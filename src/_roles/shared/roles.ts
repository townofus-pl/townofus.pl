import type {Teams} from "./teams";
import type {RoleSetting} from "./settings";
import type {RoleAbility} from "./abilities";
import type {ReactNode} from "react";

export type Role = {
    name: string;
    color: string;
    team: Teams;
    icon: string;
    description: ReactNode;
    settings: Record<string, RoleSetting>;
    abilities: RoleAbility[];
    tip?: string;
}