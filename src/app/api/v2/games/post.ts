import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';
import { formatZodError } from '@/app/api/schema/common';
import { V2GamePayloadSchema } from '@/app/api/schema/gamesV2';
import { createGameV2, IngestRejected } from './_utils/createGameV2';

export async function POST(request: NextRequest, _authContext: { user: { username: string } }) {
    try {
        const { env } = await getCloudflareContext();
        const prisma = getPrismaClient(env.DB);

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return createErrorResponse('Invalid JSON in request body', 400);
        }

        const parsed = V2GamePayloadSchema.safeParse(body);
        if (!parsed.success) {
            return createErrorResponse(
                'Invalid v2 payload: ' + JSON.stringify(formatZodError(parsed.error)),
                400,
            );
        }

        const result = await createGameV2(prisma, env.DB, parsed.data);

        // No identity column reaches this body — #287. Names are already public.
        return createSuccessResponse({ message: 'Game created successfully', ...result }, 201);
    } catch (error) {
        // 409 and 422 are the mod's signal to stop retrying; only 5xx earns a retry (ApiClient).
        if (error instanceof IngestRejected) {
            return createErrorResponse(error.message, error.status);
        }

        console.error('v2 game creation error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return createErrorResponse(`Failed to create game: ${message}`, 500);
    }
}
