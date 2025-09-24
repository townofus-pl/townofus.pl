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
export function generateOpenApiDocument(currentPort?: string) {
  // Register security schemes with the registry
  openApiRegistry.registerComponent('securitySchemes', 'basicAuth', {
    type: 'http',
    scheme: 'basic',
    description: 'HTTP Basic Authentication using API credentials',
  });

  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  
  // Use dynamic server URL based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let serverUrl: string;
  let serverDescription: string;
  
  if (isDevelopment) {
    // Use current port from request, fallback to common dev ports
    const port = currentPort || process.env.PORT || '3000';
    
    // Skip default ports (80/443) in URLs
    if (port === '80' || port === '443') {
      const protocol = port === '443' ? 'https' : 'http';
      serverUrl = `${protocol}://localhost`;
    } else {
      serverUrl = `http://localhost:${port}`;
    }
    
    // Add descriptive text based on common ports
    if (port === '3000') {
      serverDescription = 'Development server (npm run dev)';
    } else if (port === '8787') {
      serverDescription = 'Preview server (npm run preview)';
    } else if (port === '80') {
      serverDescription = 'Development server (HTTP)';
    } else if (port === '443') {
      serverDescription = 'Development server (HTTPS)';
    } else {
      serverDescription = `Development server (port ${port})`;
    }
  } else {
    serverUrl = 'https://townofus.pl';
    serverDescription = 'Production server';
  }
  
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
        url: serverUrl,
        description: serverDescription,
      },
    ],
    tags: [
      {
        name: 'System',
        description: 'System information and health endpoints',
      },
      {
        name: 'Admin',
        description: 'Administrative operations requiring authentication',
      },
      {
        name: 'Games',
        description: 'Among Us game data management and statistics',
      },
      {
        name: 'Players',
        description: 'Player management and statistics',
      },
    ],
  });
}

/**
 * Type helper for OpenAPI specification
 */
export type OpenApiSpec = ReturnType<typeof generateOpenApiDocument>;
