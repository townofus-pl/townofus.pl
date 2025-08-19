import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { z } from 'zod';

// Schema for adding a new user
const AddUserSchema = z.object({
  username: z.string().min(1).max(50)
});

// POST /api/dramaafera/zapisy/admin/add-user - Add a new user (Admin only)
export const POST = withCors(withAuth(async (request: NextRequest) => {
  // Get Cloudflare context for environment bindings
  const { env } = await getCloudflareContext();
  
  try {
    // Get DB from Cloudflare environment
    if (!env?.DB) {
      return createErrorResponse('Database not available', 500);
    }

    const prisma = getPrismaClient(env.DB);

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate request data
    const validationResult = AddUserSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse('Invalid request data: ' + validationResult.error.message, 400);
    }

    const { username } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.zapisyUser.findUnique({
      where: { username }
    });

    if (existingUser) {
      return createErrorResponse('User already exists', 400);
    }

    // Create new user
    const newUser = await prisma.zapisyUser.create({
      data: { username }
    });

    return createSuccessResponse({
      message: 'User added successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Error adding user:', error);
    return createErrorResponse('Failed to add user', 500);
  }
}));
