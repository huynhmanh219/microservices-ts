import type { Request, Response } from "express";
import { CategoryStatusEnum } from "../model/model.js";
import { CategoryReposistence } from "./repository/dto.js";

export const deleteCategoryApi = async(req:Request,res:Response) =>{
    
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
    await CategoryReposistence.destroy({where:{id}});
    return res.status(201).json({
        message:"",
        data:[]
    })
}