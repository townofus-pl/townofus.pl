# GitHub Copilot Instructions for TownOfUs.pl

## Project Overview
TownOfUs.pl is a Polish Among Us community website built with **Next.js 15**, **TypeScript**, and deployed on **Cloudflare Workers**. It serves as a comprehensive role search engine for the Town of Us mod, featuring game statistics tracking.

## Tech Stack & Architecture

### Core Technologies
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite) with Prisma ORM
- **Deployment**: Cloudflare Workers via OpenNext.js adapter
- **Storage**: Cloudflare R2 for assets

### Key Dependencies
```json
{
  "next": "~15.3",
  "react": "^19.1.0",
  "@opennextjs/cloudflare": "^1.6.1",
  "@prisma/adapter-d1": "^6.13.0",
  "tailwindcss": "^3.4.17",
  "zod": "^3.23.8"
}
```

## Project Structure & Organization

### Directory Structure
```
src/
├── app/                          # Next.js App Router
│   ├── _components/              # Shared components
│   ├── _fonts/                   # Custom BrookPL font
│   ├── api/                      # API routes with OpenAPI
│   │   ├── _database/            # Prisma client utilities
│   │   ├── _middlewares/         # Auth + CORS middleware
│   │   └── schema/               # Zod schemas & OpenAPI registry
│   ├── (pages)/                  # Route groups
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Homepage with role search
├── constants/                    # Type definitions & enums
│   ├── teams.ts                  # Team colors & types
│   ├── rolesAndModifiers.ts      # Core role interfaces
│   ├── settings.ts               # Role setting types
│   └── abilities.ts              # Ability definitions
├── roles/                        # Individual role definitions
│   ├── index.ts                  # Exported roles array
│   └── (role-files).ts          # Individual role configs
├── modifiers/                    # Game modifiers
├── data/                         # Static game data
└── generated/                    # Auto-generated types
```

### Component Organization
- **Universal components**: `src/app/_components/` (used across multiple pages)
- **Page-specific components**: Inside respective page directories
- **Shared layouts**: `src/app/layout.tsx` with custom fonts

## Core Data Types & Interfaces

### Role Interface
```typescript
export type Role = {
  type: RoleOrModifierTypes.Role;
  name: string;                    // Display name
  id: string;                      // Unique identifier
  color: string;                   // Hex color code
  team: Teams;                     // Crewmate | Impostor | Neutral
  icon: string;                    // Path to role icon
  description: ReactNode;          // Rich text description
  settings: Record<string, Setting>; // Configurable settings
  abilities: Ability[];           // Role abilities
  tip?: string;                    // Optional gameplay tip
}
```

### Setting Types
```typescript
export enum SettingTypes {
  Percentage = 'percentage',
  Time = 'time',
  Boolean = 'boolean',
  Number = 'number',
  Text = 'text',
  Multiplier = 'multiplier'
}
```

### Team System
```typescript
export enum Teams {
  All = 'All',
  Crewmate = "Crewmate",
  Impostor = "Impostor",
  Neutral = "Neutral"
}

// Team colors for UI theming
export enum TeamColors {
  Crewmate = "rgb(0, 255, 255)",    // Cyan
  Impostor = "rgb(255, 0, 0)",      // Red
  Neutral = "rgb(167, 167, 167)"    // Gray
}
```

## Styling & Design System

### Tailwind Configuration
```typescript
// Custom color scheme
colors: {
  'role-crewmate': TeamColors.Crewmate,
  'role-impostor': TeamColors.Impostor,
  'role-neutral': TeamColors.Neutral,
}

// Typography
fontFamily: {
  brook: "var(--font-brook)",      // Custom BrookPL for headings
  barlow: "var(--font-barlow)",    // Barlow for body text
}
```

### Design Principles
- **Polish language content** - All user-facing text in Polish
- **Role-based theming** - Use team colors for visual hierarchy
- **Responsive design** - Mobile-first approach with Tailwind
- **Accessibility** - Proper contrast ratios and semantic markup
- **Custom typography** - BrookPL font for distinctive headings

## API Architecture

### Route Structure
```
src/app/api/
├── _middlewares/           # Global middleware
│   ├── auth.ts            # HTTP Basic Auth protection
│   └── cors.ts            # CORS handling
├── schema/                # Shared schemas
│   ├── registry.ts        # OpenAPI registry
│   └── route.ts          # Schema endpoint
├── docs/                  # Swagger UI
├── status/                # Health check
└── (endpoints)/           # Feature endpoints
    ├── get.ts            # GET handler
    ├── post.ts           # POST handler
    └── route.ts          # Export handlers
```

### API Guidelines
- **Authentication**: All endpoints protected with HTTP Basic Auth
- **CORS**: Enabled for cross-origin API testing
- **OpenAPI**: Auto-generated documentation at `/api/docs`
- **Type Safety**: Zod schemas for request/response validation
- **Method Separation**: Individual files for each HTTP method

## Database Integration

### Prisma Configuration
```typescript
// Database setup with D1 adapter
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaD1(env.DB);
const prisma = new PrismaClient({ adapter });
```

### Migration Commands
```bash
npm run db:generate                # Generate Prisma client
npm run db:migrate:create          # Create new migration
npm run db:migrate:apply:local     # Apply to local D1
npm run db:migrate:apply:preview   # Apply to preview D1
npm run db:migrate:apply:remote    # Apply to production D1
```

## Cloudflare Workers Best Practices

### Environment Configuration
```toml
# wrangler.toml
main = ".open-next/worker.js"
name = "townofus-pl"
compatibility_date = "2025-07-12"
compatibility_flags = ["nodejs_compat"]

[assets]
binding = "ASSETS"
directory = ".open-next/assets"

[[d1_databases]]
binding = "DB"
database_name = "townofus-pl"
```

### Development Scripts
```json
{
  "dev": "next dev --turbopack",
  "preview": "npm run db:migrate:apply:preview && opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
}
```

## Code Style & Standards

### TypeScript Guidelines
- **Strict mode enabled** - Use proper type definitions
- **Interface over type** - Prefer interfaces for object shapes
- **Enum usage** - Use enums for constants with semantic meaning
- **Optional chaining** - Use `?.` for safe property access

### React Patterns
- **Server Components first** - Use client components only when needed
- **Composition over inheritance** - Prefer component composition
- **Custom hooks** - Extract complex logic into reusable hooks
- **Error boundaries** - Implement proper error handling

### File Naming
- **camelCase** - For TypeScript files and components
- **kebab-case** - For route segments and assets
- **PascalCase** - For component names and interfaces
- **SCREAMING_SNAKE_CASE** - For constants and environment variables

## Development Workflow

### Local Development
1. Install dependencies: `npm ci`
2. Set up environment: `cp .dev.vars.example .dev.vars`
3. Generate database: `npm run db:generate`
4. Apply migrations: `npm run db:migrate:apply:local`
5. Start development: `npm run dev`

### Environment Management
- **Local**: Uses local D1 database for development
- **Preview**: Deployed to preview environment for testing
- **Production**: Live site with production database

### Deployment Pipeline
- **GitHub Actions** - Automated deployment on push to main
- **Database migrations** - Auto-applied during deployment
- **Environment variables** - Managed via GitHub Secrets

## Feature Development Guidelines

### Adding New Roles
1. Create role file in `src/roles/[role-name].ts`
2. Define role object with required properties
3. Add abilities if needed
4. Export from `src/roles/index.ts`
5. Add Polish description and proper team assignment

### Adding API Endpoints
1. Create method files (e.g., `get.ts`, `post.ts`)
2. Define Zod schemas for validation
3. Register with OpenAPI registry
4. Use `withAuth` and `withCors` middleware
5. Export handlers in `route.ts`

### Database Changes
1. Update Prisma schema
2. Create migration: `npm run db:migrate:create`
3. Apply locally: `npm run db:migrate:apply:local`
4. Test changes thoroughly
5. Deploy with automatic migration

## Security & Performance

### Security Measures
- **HTTP Basic Auth** - All API endpoints protected
- **Input validation** - Zod schemas for all inputs
- **SQL injection protection** - Prisma handles prepared statements
- **Rate limiting** - Implemented for score submissions
- **CORS policy** - Properly configured for API access

### Performance Optimization
- **Static generation** - Use SSG where possible
- **Image optimization** - Next.js Image component
- **Code splitting** - Automatic with Next.js App Router
- **Edge deployment** - Cloudflare Workers global distribution
- **Caching strategies** - Leverage Cloudflare's edge cache

## Troubleshooting & Common Issues

### Development Issues
- **Type errors** - Run `npm run cf-typegen` to regenerate types
- **Database issues** - Check D1 connection and migrations
- **Build failures** - Verify OpenNext configuration
- **Font loading** - Ensure BrookPL.woff is in `src/app/_fonts/`

### Deployment Issues
- **Environment variables** - Check GitHub Secrets configuration
- **Migration failures** - Verify database schema changes
- **Asset loading** - Check Cloudflare Workers Assets configuration
- **CORS errors** - Verify middleware setup in API routes

### Polish Localization
- All user-facing content in Polish
- Proper Polish typography with BrookPL font
- Polish-specific character handling
- Cultural references in descriptions

---

*Generated for TownOfUs.pl - Polish Among Us Community Website*
*Next.js 15 + TypeScript + Cloudflare Workers + D1 Database*
