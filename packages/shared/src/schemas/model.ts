import { z } from "zod";

export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  isDefault: z.boolean().optional(),
  description: z.string().optional(),
});

export const modelListResponseSchema = z.object({
  models: z.array(modelSchema),
});

export type Model = z.infer<typeof modelSchema>;
export type ModelListResponse = z.infer<typeof modelListResponseSchema>;
