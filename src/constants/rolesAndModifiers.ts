import type {Teams} from "./teams";
import type {Setting} from "./settings";
import type {Ability} from "./abilities";
import type {ReactNode} from "react";
import type {ModSource} from "./modSources";
import type {RoleSubgroups} from "@/constants/roleSubgroups";

export enum RoleOrModifierTypes {
    Role = "role",
    Modifier = "modifier",
}

export type RoleOrModifier = {
    type: RoleOrModifierTypes;
    name: string;
    id: string;
    source?: ModSource;
    color: string;
    team: Teams;
    subgroup?: RoleSubgroups;
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
