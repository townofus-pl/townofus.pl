import { z } from 'zod';

export const GetDramaAferaSettingsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    current: z.string(),
    old: z.string().nullable(),
  }),
  error: z.string().optional(),
});

export type GetDramaAferaSettingsResponse = z.infer<typeof GetDramaAferaSettingsResponseSchema>;

export const UploadDramaAferaSettingsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type UploadDramaAferaSettingsResponse = z.infer<typeof UploadDramaAferaSettingsResponseSchema>;

/**
 * Query-param schema for `POST /api/dramaafera/settings`.
 * - `mode`: rotation flow selector (defaults to `normal` when absent).
 * - `targetVersion`: required only when `mode === 'advanced'`; identifies the
 *   row to replace without rotation.
 */
export const UploadDramaAferaSettingsQuerySchema = z
  .object({
    mode: z.enum(['normal', 'advanced']).default('normal'),
    targetVersion: z.enum(['current', 'old']).optional(),
  })
  .refine((q) => q.mode !== 'advanced' || q.targetVersion !== undefined, {
    message: 'targetVersion is required when mode=advanced',
    path: ['targetVersion'],
  });

export type UploadDramaAferaSettingsQuery = z.infer<typeof UploadDramaAferaSettingsQuerySchema>;
