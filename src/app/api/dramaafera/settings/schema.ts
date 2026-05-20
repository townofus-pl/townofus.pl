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
  message: z.string(),
  data: z.object({
    current: z.object({
      id: z.number(),
      versionType: z.literal('current'),
      uploadedAt: z.string(),
    }).nullable(),
    old: z.object({
      id: z.number(),
      versionType: z.literal('old'),
      uploadedAt: z.string(),
    }).nullable(),
  }).optional(),
  error: z.string().optional(),
});

export type UploadDramaAferaSettingsResponse = z.infer<typeof UploadDramaAferaSettingsResponseSchema>;
