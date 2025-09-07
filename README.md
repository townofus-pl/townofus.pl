# TownOfUs.pl

Polish Among Us community website built with Next.js 15, TypeScript, and Cloudflare Workers.

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite) with Prisma ORM
- **API**: Auto-generated OpenAPI 3.0 documentation with CORS support
- **Deployment**: Cloudflare Workers

## Features

- 🔒 **Secure**: All API endpoints protected with HTTP Basic Auth
- 📊 **Type-Safe**: Full TypeScript integration with Prisma
- 🚀 **Clean**: Method separation, co-located schemas
- 📖 **Auto-Docs**: Interactive Swagger UI at `/api/docs`
- 🌐 **CORS Ready**: Cross-origin support for API testing

## Quick Start

### Prerequisites
- Node.js >= 22.13.1
- Cloudflare account with D1 access

### Setup

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Configure environment**
   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. **Setup database**
   ```bash
   npm run db:generate
   npm run db:migrate:apply:local
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Database Migrations

This project uses **Wrangler CLI + Prisma migrate diff** approach for D1 migrations.

### Creating New Migrations

1. **Update Prisma schema** in `prisma/schema.prisma`
2. **Create migration file**:
   ```bash
   npm run db:migrate:create feature_name
   ```
3. **Generate SQL from schema changes**:
   ```bash
   npm run db:migrate:diff -- --output prisma/migrations/0002_feature_name.sql
   ```
4. **Apply locally**:
   ```bash
   npm run db:migrate:apply:local
   ```
5. **Regenerate Prisma client**:
   ```bash
   npm run db:generate
   ```

### Database Commands

```bash
npm run db:generate                # Generate Prisma client
npm run db:migrate:create <name>   # Create new migration file
npm run db:migrate:diff            # Generate SQL from schema changes
npm run db:migrate:apply:local     # Apply migrations to local D1
npm run db:migrate:apply:preview   # Apply migrations to preview D1
npm run db:migrate:apply:remote    # Apply migrations to production D1
npm run db:execute:local           # Execute SQL on local D1
npm run db:execute:preview         # Execute SQL on preview D1
npm run db:execute:remote          # Execute SQL on production D1
```

### Database Inspection

```bash
# View all tables
wrangler d1 execute townofus-pl --local --command "SELECT name FROM sqlite_master WHERE type='table';"

# Interactive SQL shell
wrangler d1 execute townofus-pl --local

# Check migration status
wrangler d1 migrations list townofus-pl --local
```

## API Documentation

### Access
- **Interactive Docs**: Visit `/api/docs` for Swagger UI
- **Status Check**: Visit `/api/status` for health check
- **OpenAPI Schema**: Available at `/api/schema`

### Authentication
All API endpoints require HTTP Basic Auth:
- **Username**: `demo_user`
- **Password**: `demo_pass`

### Security & CORS
- **Global Protection**: All API routes secured with HTTP Basic Auth
- **CORS Enabled**: Cross-origin support for API testing
- **Environment-Aware**: Different policies for dev vs production

## Project Structure

```
src/app/api/
├── _database/          # Prisma client utilities
├── _utils/             # Response helpers
├── _middlewares/       # Auth + CORS middleware
├── schema/             # Shared schemas & OpenAPI registry
├── docs/               # Swagger UI
├── status/             # Health check endpoint
└── fruits/             # Example CRUD API
    ├── get.ts          # GET /api/fruits
    ├── post.ts         # POST /api/fruits
    └── [id]/
        ├── get.ts      # GET /api/fruits/{id}
        ├── put.ts      # PUT /api/fruits/{id}
        └── delete.ts   # DELETE /api/fruits/{id}
```

## Adding New Endpoints

1. **Create method file** (e.g., `users/post.ts`):
   ```typescript
   import { withAuth, withCors } from '@/app/api/_middlewares';
   import { openApiRegistry } from '@/app/api/schema/registry';

   // Define & register schema
   const CreateUserSchema = z.object({
     username: z.string().min(1)
   });
   openApiRegistry.register('CreateUser', CreateUserSchema);

   // Register endpoint
   openApiRegistry.registerPath({
     method: 'post',
     path: '/api/users',
     summary: 'Create user',
     // ... responses
   });

   // Handler with route-level auth & CORS protection
   export const POST = withCors(withAuth(async (request) => {
     // Implementation
   }));
   ```

2. **Export in route.ts**:
   ```typescript
   export { POST } from './post';
   ```

3. **Add to schema imports** in `schema/route.ts`:
   ```typescript
   await import('@/app/api/users/post');
   ```

**That's it!** Route-level wrappers (`withAuth`, `withCors`) handle:
- HTTP Basic Auth for all endpoints
- CORS headers automatically
- Cloudflare Workers compatibility

Documentation updates automatically in `/api/docs`.



## Deployment

### Development
```bash
npm run dev        # Local development (uses local D1)
npm run preview    # Preview build (uses preview D1 + auto-migrates)
```

### Production
Automated via GitHub Actions on push to `main`:
1. Applies database migrations to production D1
2. Builds and deploys to Cloudflare Workers

**Required GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers and D1 permissions
- `API_USERNAME` - Basic auth username for API endpoints
- `API_PASSWORD` - Basic auth password for API endpoints

## License

MIT License
