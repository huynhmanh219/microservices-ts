import type { Request, Response } from "express";
import { CategoryReposistence } from "./repository/dto.js";
import { UpdateCategorySchema } from "../model/dto.js";
import {  CategoryStatusEnum, type Category } from "../model/model.js";

export const updateCategoryApi = async(req:Request,res:Response) =>{
    try {
        const {success,data,error} = UpdateCategorySchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                message:error.message
            });
        }
        const {id} = req.params;
        
        if(!id){
            return res.status(400).json({
                message:"ID is required"
            });
        }
        const category = await CategoryReposistence.findByPk(id);
        if(!category){
            return res.status(404).json({
                message:"Category not found"
            });
        }
        if(category.status === CategoryStatusEnum.enum.deleted){
            return res.status(400).json({
                message:"Category is deleted"
            });
        }
        await CategoryReposistence.update(data,{where:{id}});
        res.status(200).json({
            message:"Category updated successfully",
            data:req.body
        });
    } catch (error) {
        res.status(500).json({
            message:"Internal server error"
        });
    }
}