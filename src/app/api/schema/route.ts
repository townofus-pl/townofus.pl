import { NextResponse } from 'next/server';

/**
 * Dynamic OpenAPI Schema Generation Endpoint
 * 
 * This endpoint generates the OpenAPI schema on-demand by importing all route handlers
 * and collecting their registered schemas and endpoints.
 */

async function importRouteHandlers() {
  try {
    // Import all API method handlers to trigger schema registration
    // This ensures all endpoints and schemas are included in the generated documentation
    await import('@/app/api/fruits/get');
    await import('@/app/api/fruits/post');
    await import('@/app/api/fruits/[id]/get');
    await import('@/app/api/fruits/[id]/put');
    await import('@/app/api/fruits/[id]/delete');
    await import('@/app/api/status/route');
    
    // Add more method imports here as you create new endpoints
    // await import('@/app/api/users/get');
    // await import('@/app/api/users/post');
    // await import('@/app/api/games/get');
    // await import('@/app/api/roles/get');
    
  } catch (error) {
    console.error('Error importing route handlers:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // First, import all route handlers to register their schemas
    await importRouteHandlers();
    
    // Now import the registry and generate the document
    const { generateOpenApiDocument } = await import('./registry');
    const openApiDoc = generateOpenApiDocument();
    
    // Return the OpenAPI specification as JSON
    return NextResponse.json(openApiDoc, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error generating OpenAPI schema:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate OpenAPI schema',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

