import type { Request, Response } from "express";
import { CategoryConDTOSchema, CreateCategorySchema, UpdateCategorySchema, type CategoryConDTO } from "../../model/dto.js";
import type { ICategoryUseCase } from "../../interface/index.js";
import { PagingDTOSchema, type PagingDTO } from "../../../../share/model/paging.js";
import type { ZodError } from "zod";

export class CategoryHttpService{
    constructor(private readonly useCase:ICategoryUseCase){}

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
    async getDetailCategoryAPI(req:Request,res:Response){
        const {id} = req.params;
        if(!id){
            return res.status(400).json({
                message:"ID is required"
            });
        }
        const category = await this.useCase.getDetailCategory(id);
        if(!category){
            return res.status(404).json({
                message:"Category not found"
            });
        }
        return res.status(200).json({
            message:"Category found successfully",
            data:category
        });
    }
    async updateCategoryAPI(req:Request,res:Response){
        const {id} = req.params;
        if(!id){
            return res.status(400).json({
                message:"ID is required"
            });
        }
        const {success,data,error} = UpdateCategorySchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                message:error.message
            });
        }
        const category = await this.useCase.UpdateCategory(id,data);
        if(!category){
            return res.status(400).json({
                message:"Category update failed"
            });
        }
        return res.status(200).json({
            message:"Category updated successfully",
            data:category
        });}
    async deleteCategoryAPI(req:Request,res:Response){
        const {id} = req.params;
        if(!id){
            return res.status(400).json({
                message:"ID is required"
            });
        }
        const category = await this.useCase.DeleteCategory(id);
        if(!category){
            return res.status(400).json({
                message:"Category delete failed"
            });
        }
        return res.status(200).json({
            message:"Category deleted successfully",
            data:category
        });
    }
    async listCategoryAPI(req:Request,res:Response){
        const {success,data,error} = PagingDTOSchema.safeParse(req.query);
        if(error){
            const issues = (error as ZodError).issues;
            for(const issue of issues){
                
            }
        }
        if(!success){
            return res.status(400).json({
                message:"Page and limit are required"
            });
        }
        const {page,limit} = data;
        const paging:PagingDTO = {
            page,
            limit
        };
        const cond = CategoryConDTOSchema.parse(req.body);
        const category = await this.useCase.ListCategory(cond,paging);
        if(category.length === 0){
            return res.status(404).json({
                message:"Category not found"
            });
        }
        return res.status(200).json({
            message:"Category list successfully",
            data:category,
            paging:paging,
            filter:cond
        });
    }
}