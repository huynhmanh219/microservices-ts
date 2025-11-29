import z from "zod";

export const CategoryStatusEnum = z.enum(['active', 'inactive', 'deleted']);

const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  image: z.string().url().max(100).nullable().optional(),
  position: z.number().int().nullable().optional(),
  description: z.string().max(50).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  status: CategoryStatusEnum.nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_at: z.date().nullable().optional(),
});



export type CategoryStatus = z.infer<typeof CategoryStatusEnum>;
export type Category = z.infer<typeof CategorySchema>;
