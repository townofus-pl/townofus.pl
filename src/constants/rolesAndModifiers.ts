import type {Teams} from "./teams";
import type {Setting} from "./settings";
import type {Ability} from "./abilities";
import type {ReactNode} from "react";

export enum RoleOrModifierTypes {
    Role = "role",
    Modifier = "modifier",
}

export type RoleOrModifier = {
    type: RoleOrModifierTypes;
    name: string;
    id: string;
    color: string;
    team: Teams;
    icon: string;
    description: ReactNode;
    settings: Record<string, Setting>;
    abilities: Ability[];
    tip?: string;
}

export type Role = RoleOrModifier & {
    type: RoleOrModifierTypes.Role;
}

export type Modifier = RoleOrModifier & {
    type: RoleOrModifierTypes.Modifier;
}
