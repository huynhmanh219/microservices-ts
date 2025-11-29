import z from "zod";
import { CategoryStatusEnum } from "./model.js";

export const CreateCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    image: z.string().url("Invalid URL format").max(100).optional(),
    position: z.number().int("Position must be an integer").optional(),
    description: z.string().max(50, "Description must be less than 50 characters").optional(),
    parent_id: z.string().uuid("Invalid parent_id format").optional(),
    status: CategoryStatusEnum.optional(),
  });
  
export const UpdateCategorySchema = z.object({
    name: z.string().min(1).max(50).optional(),
    image: z.string().url().max(100).optional(),
    position: z.number().int().optional(),
    description: z.string().max(50).optional(),
    parent_id: z.string().uuid().optional(),
    status: CategoryStatusEnum.optional(),
  });

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;