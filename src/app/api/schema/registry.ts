import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

/**
 * Global OpenAPI Registry
 * 
 * This registry collects schemas and route definitions from individual route handlers.
 * Each route file should register its schemas and endpoints with this registry.
 * 
 * Usage in route files:
 * ```typescript
 * import { openApiRegistry } from '@/app/api/schemas/registry';
 * 
 * // Register your schemas
 * openApiRegistry.register('SchemaName', YourZodSchema);
 * 
 * // Register your endpoints
 * openApiRegistry.registerPath({ ... });
 * ```
 */
export const openApiRegistry = new OpenAPIRegistry();

/**
 * Generate OpenAPI documentation
 * 
 * This function generates the complete OpenAPI specification from all
 * registered schemas and route definitions.
 */
export function generateOpenApiDocument() {
  // Register security schemes with the registry
  openApiRegistry.registerComponent('securitySchemes', 'basicAuth', {
    type: 'http',
    scheme: 'basic',
    description: 'HTTP Basic Authentication using API credentials',
  });



  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      version: '1.0.0',
      title: 'TownOfUs.pl API',
      description: 'REST API for the Polish Among Us community website',
      contact: {
        name: 'TownOfUs.pl Team',
        url: 'https://townofus.pl',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://townofus.pl',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Fruits',
        description: 'Fruit management operations',
      },
    ],
  });
}

/**
 * Type helper for OpenAPI specification
 */
export type OpenApiSpec = ReturnType<typeof generateOpenApiDocument>;