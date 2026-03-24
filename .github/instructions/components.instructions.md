---
applyTo: "src/app/_components/**,src/app/dramaafera/_components/**"
---
# Component & Styling Patterns

## Export conventions

  // Server Component (default) — arrow function const, named export
  export const RoleCard: FC<{ role: Role; hideSettings?: boolean }> = ({ role, hideSettings = false }) => (
    <div>...</div>
  );

  // Client Component — function declaration, default export, 'use client' directive
  'use client';
  export default function Navigation({ items }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    return <nav>...</nav>;
  }

## Props typing

  // Simple components: inline FC generic
  export const Team: FC<{ team: Teams }> = ({ team }) => ...

  // Complex client components: dedicated interface
  interface PlayerTableProps {
    players: UIPlayerData[];
    showRanking?: boolean;
  }
  export default function PlayerTable({ players, showRanking = false }: PlayerTableProps) { ... }

## Component organization

  // Complex component → directory with sub-components and hooks
  RolesList/
    RolesList.tsx           // Main component
    Search.tsx              // Sub-component
    Filters.tsx             // Sub-component
    hooks/
      index.ts              // Barrel re-export
      useSearch.ts
      useFilters.ts
      useRolesListContext.ts

  // Simple component → flat file
  YouTubeEmbed.tsx
  SlotsDisplay.tsx

## Barrel exports

  // src/app/_components/index.ts — only re-export truly cross-page components
  export * from "./Header/Header";
  export * from "./RolesList/RolesList";

  // Other components (PlayerTable, FileUpload, etc.) are imported by direct path

## State management

- React Context for intra-component-tree state (e.g. RolesListContext for search/filter)
- No global state library — keep state as local as possible
- Custom hooks extracted into `hooks/` subdirectory with barrel index.ts

## Client boundary placement

- Add 'use client' ONLY on components that need state, effects, event handlers, or browser APIs
- Leaf presentation components (Team, RoleCard, SettingsList, NavigationLabel) remain server components
- Interactive wrappers (Navigation, RolesList, PlayerTable) are client components

## Icons

  // UI icons — @deemlol/next-icons (only Menu and Link/LinkIcon are used)
  import { Menu } from '@deemlol/next-icons';
  <Menu className="w-7 h-7 p-1 border-2 border-foreground rounded-2xl" />

  // Game icons — static PNGs via next/image
  import Image from 'next/image';
  <Image src={role.icon} alt={role.name} width={64} height={64} />
  // Role icons: /images/roles/<id>.png
  // Ability icons: /images/abilities/<name>.png

  // UI indicators — unicode characters
  // Expand/collapse: '▼' / '▶'   Accordion: '▲' / '▼'
  // Boolean: '✓' / '✗'           Categories: '⚙️' / '🔪'

## Color system

  // Base dark theme
  bg-zinc-900/50    bg-zinc-800/80    bg-zinc-700/60    // with opacity modifiers

  // Accent & semantic colors
  text-yellow-400         // headings, highlights, table headers
  text-orange-300         // player names
  text-green-400          // wins, positive values
  text-red-400            // losses, negative values
  bg-green-700/80         // win background
  bg-red-800/80           // loss background

  // Team colors (from Tailwind config)
  text-role-crewmate      // cyan  rgb(0,255,255)
  text-role-impostor      // red   rgb(255,0,0)
  text-role-neutral       // gray  rgb(167,167,167)
  // Also: bg-role-*, border-role-*

  // Dynamic role colors — inline style (each role has a unique hex color)
  style={{ color: role.color, borderColor: role.color }}

## Tailwind custom utilities

  font-brook              // BrookPL — all headings and role names
  font-barlow             // Barlow — body text (set on <body> by default)
  border-5                // 5px border (role card left accent border)
  grid-cols-2/1           // grid-template-columns: 2fr 1fr
  bg-discord-blurple      // Discord brand color #5865F2
  border-search           // rgb(51,51,51) — search/filter input borders
  bg-chevron-gray         // gray SVG chevron-down for custom <select> arrows (use with appearance-none)

## Custom CSS classes (globals.css)

  .glow-yellow            // yellow box-shadow glow effect
  .animate-scroll-left    // horizontal infinite scroll animation (intro)
  .pixelated              // pixel-art rendering + monospace font
  .flip-card-container    // 3D card flip animation (podium reveal)
  .flip-card-flipped
  .flip-card-front
  .flip-card-back

## Layout patterns

  max-w-screen-xl m-auto                          // root container
  bg-zinc-900/50 rounded-xl                       // card base
  border-l-5                                      // colored accent border (role cards)
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  // responsive grid
  text-sm md:text-base                            // responsive base font (on <html>)

## Responsive text

Root `<html>` has `className="text-sm md:text-base"` for globally responsive base font size.
Headings use large sizes: `text-7xl`, `text-6xl`, `text-5xl`, `text-3xl` with `font-brook`.

## No CSS Modules

The project uses exclusively Tailwind utility classes + a small set of custom utilities in
globals.css. Do not introduce CSS Modules (*.module.css).
