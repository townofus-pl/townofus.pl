import {Aftermath} from './aftermath'
import {Bait} from './bait'
import {ButtonBarry} from './buttonbarry'
import {Celebrity} from './celebrity'
import {Diseased} from './diseased'
import {Disperser} from './disperser'
import {DoubleShot} from './doubleshot'
import {Flash} from './flash'
import {Frosty} from './frosty'
import {Giant} from './giant'
import {Immovable} from './immovable'
import {Lovers} from './lovers'
import {Mini} from './mini'
import {Multitasker} from './multitasker'
import {Radar} from './radar'
import {Saboteur} from './saboteur'
import {Satellite} from './satellite'
import {Shy} from './shy'
import {SixthSense} from './sixthsense'
import {Sleuth} from './sleuth'
import {Taskmaster} from './taskmaster'
import {Tiebreaker} from './tiebreaker'
import {Torch} from './torch'
import {Underdog} from './underdog'

export const Modifiers = [
    Aftermath,
    Bait,
    ButtonBarry,
    Celebrity,
    Diseased,
    Disperser,
    DoubleShot,
    Flash,
    Frosty,
    Giant,
    Immovable,
    Lovers,
    Mini,
    Multitasker,
    Radar,
    Saboteur,
    Satellite,
    Shy,
    SixthSense,
    Sleuth,
    Taskmaster,
    Tiebreaker,
    Torch,
    Underdog,
].sort((a, b) => a.name.localeCompare(b.name));
