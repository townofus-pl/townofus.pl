import { V2_ACTION_TYPES } from '@/app/api/schema/gamesV2';
import { TIMELINE_HIDDEN_TYPES } from '@/app/dramaafera/_services/games/_buildGameTimeline';

// Listy podtypów dla opisów w `/api/docs`. Źródła: kod modu, locale TOU-Mira (klucze `DiedTo*`),
// rejestr ról strony i `aggregate.ts`.

/** Typy zdarzeń na osi czasu: typy akcji z modu bez tych, które oś czasu ukrywa. Lista zamknięta. */
export const EVENT_TYPES = V2_ACTION_TYPES.filter(
  (type) => !(TIMELINE_HIDDEN_TYPES as readonly string[]).includes(type),
) as unknown as readonly [string, ...string[]];

/**
 * Typy akcji, które nie mają licznika w `counters`. Gra z osią czasu podaje ich liczbę
 * dla każdego gracza w polu `actions`. Lista zamknięta.
 */
export const ACTION_COUNT_KEYS = [
  'douse', 'infect', 'bite', 'time_rewind', 'ability_used', 'vent_use', 'body_reported',
  'emergency_button', 'sabotage_started', 'sabotage_fixed', 'role_changed', 'disconnect',
] as const;

/** Klucze `causeOfDeath` z TOU-Mira (`DiedTo<klucz>`) z krótkim znaczeniem. Lista otwarta. */
export const CAUSE_OF_DEATH_KEYS: Record<string, string> = {
  Disconnect: 'rozłączenie z gry',
  Ejection: 'wyrzucenie w głosowaniu',
  Killer: 'zabity przez zabójcę',
  Punishment: 'kara',
  Winning: 'śmierć przy wygranej',
  Suicide: 'samobójstwo',
  SubmergedOxygen: 'uduszenie na mapie Submerged',
  SuicideAltruist: 'poświęcenie Altruisty',
  SuicideSheriff: 'pudło Szeryfa',
  Misguess: 'pudło przy zgadywaniu (ginie zgadujący)',
  Guess: 'trafione zgadnięcie',
  Heartbreak: 'śmierć kochanka',
  TempRevive: 'tymczasowe wskrzeszenie',
  Sheriff: 'strzał Szeryfa',
  Deputy: 'strzał Deputy',
  Veteran: 'atak Weterana',
  Jailor: 'egzekucja Jailora',
  Prosecutor: 'oskarżenie Prosecutora',
  Arsonist: 'podpalenie',
  Glitch: 'atak Glitcha',
  Juggernaut: 'atak Juggernauta',
  Pestilence: 'atak Pestilence',
  SoulCollector: 'żniwa Soul Collectora',
  Vampire: 'ugryzienie wampira',
  Werewolf: 'szał Werewolfa',
  Doomsayer: 'trafione zgadnięcie Doomsayera',
  Jester: 'zemsta Jestera',
  Executioner: 'kara Executionera',
  Spectre: 'atak Spectre',
  Inquisitor: 'atak Inquisitora',
  AmbusherAmbush: 'zasadzka Ambushera',
  BomberBomb: 'bomba Bombera',
  SpellslingerHexBomb: 'bomba klątwy Spellslingera',
  Viper: 'atak Vipera',
  Parasite: 'przejęcie przez Parasite',
  PuppetControl: 'kontrola Puppeteera',
  Medusa: 'atak Medusy',
};

/** Role, których akcje zasilają podtypy liczników, wg sezonu 4 i późniejszych. */
export const SUBTYPE_ROLES = {
  protects: { medic: ['Medic'], mirrorcaster: ['Mirrorcaster'], oracle: ['Oracle'], warden: ['Warden'] },
  kills: { standard: 'dowolna rola poza Jailor, Deputy i Prosecutor (lista otwarta)', jailorExecutes: ['Jailor'], deputyShoots: ['Deputy'] },
  other: { prosecutes: ['Prosecutor'], altruistRevives: ['Altruist', 'Time Lord'], swaps: ['Swapper'], janitorCleans: ['Janitor'], knights: ['Monarch'] },
} as const;

const list = (values: readonly string[]) => values.join(', ');
export const EVENT_TYPES_TEXT = list(EVENT_TYPES);
export const ACTION_KEYS_TEXT = list(ACTION_COUNT_KEYS);
export const CAUSE_KEYS_TEXT = Object.entries(CAUSE_OF_DEATH_KEYS).map(([key, meaning]) => `${key} (${meaning})`).join('; ');
