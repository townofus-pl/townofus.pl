---
name: create-role-or-modifier
description: Add a new game role or modifier to the Town of Us role wiki. Use this skill when asked to create a new role, add a new modifier, or define a new game character for the Town of Us mod.
---

# Create Role or Modifier

This skill adds a new role or modifier definition to the Town of Us wiki. Roles and modifiers share the same type structure but differ in defaults and registration location.

## Prerequisites

Gather from the user:

| Data             | Required | Default / Notes                                          |
|------------------|----------|----------------------------------------------------------|
| Role or modifier | Yes      | Determines type, file location, and defaults             |
| Name             | Yes      | English, PascalCase-ish (e.g., `GuardianAngel`)          |
| Team             | Yes      | `Crewmate`, `Impostor`, or `Neutral` for roles; typically `All` for modifiers |
| Color            | Yes      | Hex color string, e.g., `#006400`                        |
| Description      | Yes      | Polish text describing what the character does            |
| Settings         | Yes      | List of configurable settings with types and defaults     |
| Abilities        | No       | Custom abilities or use `CommonAbilities` (default: None for modifiers) |
| Tip              | No       | Optional Polish gameplay tip                             |
| Icon             | No       | Assumes `/images/roles/<id>.png` or `/images/modifiers/<id>.png` |

## Determining Role vs Modifier

| Aspect          | Role                                   | Modifier                              |
|-----------------|----------------------------------------|---------------------------------------|
| Type            | `RoleOrModifierTypes.Role`             | `RoleOrModifierTypes.Modifier`        |
| TypeScript type | `: Role`                               | `: Modifier`                          |
| File location   | `src/roles/<snake_case>.ts`            | `src/modifiers/<snake_case>.ts`       |
| Index file      | `src/roles/index.ts`                   | `src/modifiers/index.ts`              |
| Team default    | `Teams.Crewmate` / `Impostor` / `Neutral` | `Teams.All`                       |
| Icon path       | `/images/roles/<id>.png`               | `/images/modifiers/<id>.png`          |
| Abilities       | Often custom or `CommonAbilities.Kill` | Usually `[CommonAbilities.None]`      |

## Step 1: Create the Definition File

Create `src/roles/<snake_case_name>.ts` (or `src/modifiers/<snake_case_name>.ts`).

Use `.tsx` extension ONLY if the `description` field needs JSX (lists, styled spans). Otherwise use `.ts`.

### Role template

```typescript
import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

// Export custom abilities BEFORE the role (if any)
// export const ExampleAbilities = {
//     SpecialMove: {
//         "name": "SpecialMove (Specjalny ruch)",
//         "icon": "/images/abilities/specialmove.png"
//     }
// }

export const ExampleRole: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Example Role",
    "id": "example_role",
    "color": "#AABBCC",
    "team": Teams.Crewmate,
    "icon": "/images/roles/example_role.png",
    "description": "Opis roli po polsku.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Setting Name": {
            value: 25,
            type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
    "tip": "Opcjonalna wskazówka po polsku."
};
```

### Modifier template

```typescript
import {Modifier, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const ExampleMod: Modifier = {
    "type": RoleOrModifierTypes.Modifier,
    "name": "Example Mod",
    "id": "example_mod",
    "color": "#AABBCC",
    "team": Teams.All,
    "icon": "/images/modifiers/example_mod.png",
    "description": "Opis modyfikatora po polsku.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Setting Name": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
};
```

## Step 2: Register in Index File

Edit `src/roles/index.ts` (or `src/modifiers/index.ts`):

1. Add the import in **alphabetical order** among existing imports:
```typescript
import {ExampleRole} from "./example_role";
```

2. Add the export name to the array. The array is auto-sorted at runtime via `.sort((a, b) => a.name.localeCompare(b.name))`, but keep the source listing roughly alphabetical for readability:
```typescript
export const Roles = [
    // ... existing entries ...
    ExampleRole,
    // ... existing entries ...
].sort((a, b) => a.name.localeCompare(b.name));
```

## Settings Reference

All settings MUST start with `...probabilityOfAppearing(0)` spread as the first entry.

| Setting Type  | Value Type | Example                                                                  |
|---------------|------------|--------------------------------------------------------------------------|
| `Percentage`  | `number`   | `{ value: 50, type: SettingTypes.Percentage }`                           |
| `Time`        | `number`   | `{ value: 25, type: SettingTypes.Time }`                                 |
| `Boolean`     | `boolean`  | `{ value: false, type: SettingTypes.Boolean }`                           |
| `Number`      | `number`   | `{ value: 3, type: SettingTypes.Number }`                                |
| `Multiplier`  | `number`   | `{ value: 1.5, type: SettingTypes.Multiplier }`                          |
| `Text`        | `string`   | `{ value: "Self", type: SettingTypes.Text, description: { 0: "Self", 1: "All" } }` |

The optional `description` field maps numeric keys to display labels (used for enum/dropdown settings).

## Common Abilities Reference

```typescript
CommonAbilities.None      // "brak" — no active abilities
CommonAbilities.Kill      // "Kill (Zabij)"
CommonAbilities.Vent      // "Vent (Wejdź do wentylacji)"
CommonAbilities.Sabotage  // "Sabotage (Sabotuj)"
```

Impostor roles typically have: `[CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage]`

Custom abilities should be exported as a named object BEFORE the role definition.

## Validation Checklist

- [ ] Filename is `snake_case.ts` (or `.tsx` only if description uses JSX)
- [ ] Export name is `PascalCase` matching the role/modifier name
- [ ] `id` field matches the filename stem exactly (e.g., `"guardian_angel"` for `guardian_angel.ts`)
- [ ] No duplicate `id` — check existing files in `src/roles/` or `src/modifiers/`
- [ ] Type annotation is explicit: `: Role` or `: Modifier`
- [ ] `description` and `tip` are written in Polish
- [ ] Settings start with `...probabilityOfAppearing(0)`
- [ ] Icon path matches: `/images/roles/<id>.png` or `/images/modifiers/<id>.png`
- [ ] Import added to index file in alphabetical order
- [ ] Entry added to the exported array

## Special Cases

- **`crewmate.ts` and `pestilence.ts`** are placeholder files — do NOT import or export them
- When `description` needs rich formatting (lists, spans), use `.tsx` extension:
  ```tsx
  "description": (<>
      <p>Opis roli z listą:</p>
      <ul className="list-disc list-inside">
          <li>Punkt pierwszy,</li>
          <li>Punkt drugi.</li>
      </ul>
  </>)
  ```
