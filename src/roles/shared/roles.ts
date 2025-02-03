import type {Teams} from "./teams";
import type {Setting} from "./settings";
import type {Ability} from "./abilities";
import type {ReactNode} from "react";

export type Role = {
    name: string;
    color: string;
    team: Teams;
    icon: string;
    description: ReactNode;
    settings: Record<string, Setting>;
    abilities: Ability[];
    tip?: string;
}
