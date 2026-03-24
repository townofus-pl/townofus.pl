---
applyTo: "src/roles/**,src/modifiers/**,src/constants/rolesAndModifiers.ts,src/constants/settings.ts,src/constants/abilities.ts,src/constants/teams.ts"
---
# Roles & Modifiers Patterns

## Type system (src/constants/)

  Role = RoleOrModifier & { type: RoleOrModifierTypes.Role }
  Modifier = RoleOrModifier & { type: RoleOrModifierTypes.Modifier }

  RoleOrModifier = {
    type: RoleOrModifierTypes,    // .Role or .Modifier
    name: string,                 // Display name (English, PascalCase-ish)
    id: string,                   // Matches filename stem: "medic", "soul_collector"
    color: string,                // Hex color, e.g. "#006400"
    team: Teams,                  // Crewmate | Impostor | Neutral (roles), All | Crewmate | Impostor (modifiers)
    icon: string,                 // "/images/roles/<id>.png" or "/images/modifiers/<id>.png"
    description: ReactNode,       // Polish text — plain string or JSX fragment
    settings: Record<string, Setting>,
    abilities: Ability[],
    tip?: string                  // Optional Polish gameplay tip
  }

  Teams enum: All, Crewmate, Impostor, Neutral
  SettingTypes enum: Percentage, Time, Boolean, Number, Text, Multiplier
  Ability = { name: string, icon: string }

## File conventions

| Aspect               | Convention                                                                   |
|-----------------------|------------------------------------------------------------------------------|
| Filename              | `snake_case.ts` — use `.tsx` only when description needs JSX (lists, spans)  |
| Export name           | `PascalCase` matching role name: `GuardianAngel` from `guardian_angel.ts`    |
| Type annotation       | Explicit `: Role` or `: Modifier` on the exported const                      |
| id field              | Lowercase, equals the filename stem: `"soul_collector"`                      |
| Icon path             | Roles: `/images/roles/<id>.png` — Modifiers: `/images/modifiers/<id>.png`    |
| All user-facing text  | Written in Polish                                                            |

## Creating a new role

  // src/roles/<snake_case_name>.ts
  import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
  import {Teams} from "@/constants/teams";
  import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
  import {CommonAbilities} from "@/constants/abilities";

  // 1. Export custom abilities BEFORE the role (allows cross-referencing from other files)
  export const ExampleAbilities = {
      SpecialMove: {
          "name": "SpecialMove (Specjalny ruch)",    // English + Polish in parens
          "icon": "/images/abilities/specialmove.png"
      }
  }

  // 2. Export the role with explicit type annotation
  export const Example: Role = {
      "type": RoleOrModifierTypes.Role,
      "name": "Example",
      "id": "example",                               // must match filename
      "color": "#AABBCC",
      "team": Teams.Crewmate,                        // or Impostor, Neutral
      "icon": "/images/roles/example.png",
      "description": "Opis roli po polsku.",          // or JSX for rich formatting
      "settings": {
          ...probabilityOfAppearing(0),               // ALWAYS first
          "Custom Setting": {
              value: 10,
              type: SettingTypes.Number,
          },
      },
      "abilities": [ExampleAbilities.SpecialMove],
      "tip": "Opcjonalna wskazowka po polsku."        // optional
  };

  // 3. Register in src/roles/index.ts: add import + entry in the Roles array
  //    The array is auto-sorted by name via .sort((a, b) => a.name.localeCompare(b.name))

## Creating a new modifier

Same pattern as roles, but:
  - Type annotation: `: Modifier`
  - type field: `RoleOrModifierTypes.Modifier`
  - team: typically `Teams.All` (can apply to any team), or `Teams.Impostor` for team-restricted
  - icon path: `/images/modifiers/<id>.png`
  - abilities: usually `[CommonAbilities.None]` — modifiers rarely grant abilities
  - Register in `src/modifiers/index.ts`

## When to use .tsx

Use `.tsx` extension ONLY when the `description` field needs JSX (rich formatting):

  "description": (<>
      <p>Opis roli z listą:</p>
      <ul className="list-disc list-inside">
          <li>Punkt pierwszy,</li>
          <li>Punkt drugi.</li>
      </ul>
  </>)

For plain text descriptions, use `.ts`.

## Settings patterns

  ...probabilityOfAppearing(0)          // Always spread first in settings
  { value: 25.0, type: SettingTypes.Time }
  { value: false, type: SettingTypes.Boolean }
  { value: 1.25, type: SettingTypes.Multiplier }
  { value: 0, type: SettingTypes.Number }
  { value: "Self", type: SettingTypes.Text, description: { 0: "Self", 1: "Medic", 2: "Both" } }

The optional `description` field on a Setting maps numeric keys to display labels (enum/dropdown).

## Common abilities

  CommonAbilities.None       // "brak" — for modifiers or roles with no active abilities
  CommonAbilities.Kill       // "Kill (Zabij)"
  CommonAbilities.Vent       // "Vent (Wejdz do wentylacji)"
  CommonAbilities.Sabotage   // "Sabotage (Sabotuj)"

Impostor roles typically include: [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, ...]

## Placeholder files

  crewmate.ts and pestilence.ts exist as empty files — do NOT import or export them.
