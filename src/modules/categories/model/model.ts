import z from "zod";
import { ModelStatus } from "../../../share/model/base-model.js";

export const CategoryStatusEnum = z.enum(['active', 'inactive', 'deleted']);

const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  image: z.string().url().max(100).nullable().optional(),
  position: z.number().int().nullable().optional(),
  description: z.string().max(50).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  status: z.enum(ModelStatus).nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_at: z.date().nullable().optional(),
});



export type CategoryStatus = z.infer<typeof ModelStatus>
export type Category = z.infer<typeof CategorySchema>;
