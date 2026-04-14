import type { Modifier } from '@/constants/rolesAndModifiers';
import {MiraAftermath} from './aftermath';
import {MiraBait} from './bait';
import {MiraButtonBarry} from './buttonBarry';
import {MiraCelebrity} from './celebrity';
import {MiraCircumvent} from './circumvent';
import {MiraCrewpostor} from './crewpostor';
import {MiraDeadlyQuota} from './deadlyQuota';
import {MiraDiseased} from './diseased';
import {MiraDisperser} from './disperser';
import {MiraDoubleShot} from './doubleShot';
import {MiraEgotist} from './egotist';
import {MiraFlash} from './flash';
import {MiraFrosty} from './frosty';
import {MiraGiant} from './giant';
import {MiraImmovable} from './immovable';
import {MiraInvestigatorModifier} from './investigator';
import {MiraLovers} from './lovers';
import {MiraMini} from './mini';
import {MiraMultitasker} from './multitasker';
import {MiraNoisemaker} from './noisemaker';
import {MiraOperative} from './operative';
import {MiraRadar} from './radar';
import {MiraRotting} from './rotting';
import {MiraSaboteur} from './saboteur';
import {MiraSatellite} from './satellite';
import {MiraScientist} from './scientist';
import {MiraScout} from './scout';
import {MiraShy} from './shy';
import {MiraSixthSense} from './sixthSense';
import {MiraSleuth} from './sleuth';
import {MiraSpyModifier} from './spy';
import {MiraTaskmaster} from './taskmaster';
import {MiraTelepath} from './telepath';
import {MiraTiebreaker} from './tiebreaker';
import {MiraTorch} from './torch';
import {MiraUnderdog} from './underdog';

export const MiraModifiers: readonly Modifier[] = [
	MiraAftermath,
	MiraBait,
	MiraButtonBarry,
	MiraCelebrity,
	MiraCircumvent,
	MiraCrewpostor,
	MiraDeadlyQuota,
	MiraDiseased,
	MiraDisperser,
	MiraDoubleShot,
	MiraEgotist,
	MiraFlash,
	MiraFrosty,
	MiraGiant,
	MiraImmovable,
	MiraInvestigatorModifier,
	MiraLovers,
	MiraMini,
	MiraMultitasker,
	MiraNoisemaker,
	MiraOperative,
	MiraRadar,
	MiraRotting,
	MiraSaboteur,
	MiraSatellite,
	MiraScientist,
	MiraScout,
	MiraShy,
	MiraSixthSense,
	MiraSleuth,
	MiraSpyModifier,
	MiraTaskmaster,
	MiraTelepath,
	MiraTiebreaker,
	MiraTorch,
	MiraUnderdog,
].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
