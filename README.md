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
   cp .env.example .env
   cp dev.vars.example dev.vars
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
   
   // Simple handler - auth & CORS handled globally
   export async function POST(request) {
     // Implementation
   }
   ```

2. **Export in route.ts**:
   ```typescript
   export { POST } from './post';
   ```

3. **Add to schema imports** in `schema/route.ts`:
   ```typescript
   await import('@/app/api/users/post');
   ```

**That's it!** Global middleware at `/api/middleware.ts` handles:
- HTTP Basic Auth for all endpoints  
- CORS headers automatically
- Request logging in development

Documentation updates automatically in `/api/docs`.

## Database Commands

```bash
npm run db:generate              # Generate Prisma client
npm run db:migrate:apply:local   # Apply migrations locally  
npm run db:migrate:apply:remote  # Apply to production
```

## Deployment

### Development
```bash
npm run dev        # Local development
npm run preview    # Preview build
```

### Production
Automated via GitHub Actions on push to `main`.

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN`
- `API_USERNAME` 
- `API_PASSWORD`

## License

MIT License