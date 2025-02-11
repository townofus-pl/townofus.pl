import {Bait} from "@/modifiers/bait";
import {Disperser} from "@/modifiers/disperser";
import {Lovers} from "@/modifiers/lovers";
import {Sleuth} from "@/modifiers/sleuth";
import {Tiebreaker} from "@/modifiers/tiebreaker";


export const Modifiers = [
    Bait,
    Disperser,
    Lovers,
    Sleuth,
    Tiebreaker,
].sort((a, b) => a.name.localeCompare(b.name));
