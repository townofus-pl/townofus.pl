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
