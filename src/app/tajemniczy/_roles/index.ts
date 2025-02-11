import {Altruist} from "@/roles/altruist";
import {Engineer} from "@/roles/engineer";
import {Imitator} from "@/roles/imitator";
import {Investigator} from "@/roles/investigator";
import {Medic} from "@/roles/medic";
import {Medium} from "@/roles/medium";
import {Mystic} from "@/roles/mystic";
import {Politician} from "@/roles/politician";
import {Prosecutor} from "@/roles/prosecutor";
import {Seer} from "@/roles/seer";
import {Sheriff} from "@/roles/sheriff";
import {Snitch} from "@/roles/snitch";
import {Spy} from "@/roles/spy";
import {Swapper} from "@/roles/swapper";
import {Transporter} from "@/roles/transporter";
import {Trapper} from "@/roles/trapper";
import {Veteran} from "@/roles/veteran";
import {Vigilante} from "@/roles/vigilante";
import {Blackmailer} from "@/roles/blackmailer";
import {Bomber} from "@/roles/bomber";
import {Escapist} from "@/roles/escapist";
import {Janitor} from "@/roles/janitor";
import {Miner} from "@/roles/miner";
import {Morphling} from "@/roles/morphling";
import {Swooper} from "@/roles/swooper";
import {Traitor} from "@/roles/traitor";
import {Undertaker} from "@/roles/undertaker";
import {Warlock} from "@/roles/warlock";
import {Amnesiac} from "@/roles/amnesiac";
import {GuardianAngel} from "@/roles/guardian_angel";
import {Survivor} from "@/roles/survivor";
import {Executioner} from "@/roles/executioner";
import {Jester} from "@/roles/jester";
import {SoulCollector} from "@/roles/soul_collector";
import {Arsonist} from "@/roles/arsonist";
import {Juggernaut} from "@/roles/juggernaut";
import {Werewolf} from "@/roles/werewolf";
import {Glitch} from "@/roles/glitch";
import {TimeLord} from "./time_lord";
import {President} from "./president";
import {Foreteller} from "./foreteller";

export const Roles = [
    TimeLord,
    President,
    Foreteller,
    //ExecutionerPlus,
    //JesterPlus,
    //ElfLegacy,
    //SantaLegacy
    Altruist,
    Engineer,
    Imitator,
    Investigator,
    //Mayor,
    Medic,
    Medium,
    Mystic,
    Politician,
    Prosecutor,
    Seer,
    Sheriff,
    Snitch,
    Spy,
    Swapper,
    Transporter,
    Trapper,
    Veteran,
    Vigilante,
    Blackmailer,
    Bomber,
    Escapist,
    Janitor,
    Miner,
    Morphling,
    Swooper,
    Traitor,
    Undertaker,
    Warlock,
    Amnesiac,
    GuardianAngel,
    Survivor,
    Executioner,
    Jester,
    SoulCollector,
    Arsonist,
    Juggernaut,
    Werewolf,
    Glitch,
].sort((a, b) => a.name.localeCompare(b.name));
