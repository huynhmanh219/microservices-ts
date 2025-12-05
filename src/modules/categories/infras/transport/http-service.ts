import type { Request, Response } from "express";
import { CreateCategorySchema, type CreateCategoryDTO } from "../../model/dto.js";
import type { CategoryUseCase } from "../../usecase/index.js";

export class CategoryHttpService{
    constructor(private readonly useCase:CategoryUseCase){}

    async CreateANewCategoryAPI(req:Request,res:Response){
        const {success,data,error} = CreateCategorySchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                message:error.message
            });
        }
        const category = await this.useCase.CreateANewCategory(data);
        if(!category){
            return res.status(400).json({
                message:"Category creation failed"
            });
        }
        return res.status(201).json({
            message:"Category created successfully",
            data:category
        });
    }
}