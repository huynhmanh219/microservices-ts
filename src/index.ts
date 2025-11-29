import express, { type Request, type Response } from "express";
import { config } from "dotenv";
import { z } from "zod";

const app = express();
const port = process.env.PORT || 3000;
 
app.get("/",(req,res)=>{
    res.send("hello");
})

app.use(express.json());

// POST - Create category with Zod validation
app.post("/v1/categories",(req:Request,res:Response):void=>{
    try {
        // Validate request body with Zod
        const validatedData = CreateCategorySchema.parse(req.body);
        
        const newCategory:Category={
            id: crypto.randomUUID(),
            name: validatedData.name,
            image: validatedData.image || null,
            position: validatedData.position || null,
            description: validatedData.description || null,
            parent_id: validatedData.parent_id || null,
            status: validatedData.status || 'active',
            created_at: new Date(),
            updated_at: new Date(),
        }
        
        res.status(201).json({
            message:"category created successfully",
            category:newCategory
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        } else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
})

// GET - List categories with optional query validation
app.get("/v1/categories",(req:Request,res:Response):void=>{
    try {
        // Optional: Validate query parameters for pagination
        const querySchema = z.object({
            page: z.string().regex(/^\d+$/).transform(Number).optional(),
            limit: z.string().regex(/^\d+$/).transform(Number).optional(),
            status: CategoryStatusEnum.optional()
        });
        
        const query = querySchema.parse(req.query);
        
        // TODO: Fetch categories from database with filters
        res.status(200).json({
            message: "Categories retrieved successfully",
            query: query,
            categories: categories
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: "Invalid query parameters",
                errors: error.issues
            });
        } else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
})

// PATCH - Update category with Zod validation
app.patch("/v1/categories/:id",(req:Request,res:Response):void=>{
    try {
        // Validate URL parameter
        const idSchema = z.string().uuid();
        const categoryId = idSchema.parse(req.params.id);
        
        // Validate request body
        const validatedData = UpdateCategorySchema.parse(req.body);
        
        // TODO: Update category in database
        res.status(200).json({
            message: "Category updated successfully",
            id: categoryId,
            updates: validatedData
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        } else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
})

// DELETE - Delete category with Zod validation
app.delete("/v1/categories/:id",(req:Request,res:Response):void=>{
    try {
        // Validate URL parameter
        const idSchema = z.string().uuid();
        const categoryId = idSchema.parse(req.params.id);
        
        // TODO: Delete category from database
        res.status(200).json({
            message: "Category deleted successfully",
            id: categoryId
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        } else {
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
})
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

const categories: Category[] = [{
    id: "1",
    name: "Category 1",
    image: "https://via.placeholder.com/150",
    position: 1,
    description: "Category 1 description",
    parent_id: null,
    status: "active",
    created_at: new Date(),
    updated_at: new Date(),
}
];

// Zod Schemas
const CategoryStatusEnum = z.enum(['active', 'inactive', 'deleted']);

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

const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  image: z.string().url("Invalid URL format").max(100).optional(),
  position: z.number().int("Position must be an integer").optional(),
  description: z.string().max(50, "Description must be less than 50 characters").optional(),
  parent_id: z.string().uuid("Invalid parent_id format").optional(),
  status: CategoryStatusEnum.optional(),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  image: z.string().url().max(100).optional(),
  position: z.number().int().optional(),
  description: z.string().max(50).optional(),
  parent_id: z.string().uuid().optional(),
  status: CategoryStatusEnum.optional(),
});

// Infer TypeScript types from Zod schemas
type CategoryStatus = z.infer<typeof CategoryStatusEnum>;
type Category = z.infer<typeof CategorySchema>;
type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;
