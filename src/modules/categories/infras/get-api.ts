import type { Request, Response } from "express";
import { CategoryReposistence } from "./repository/dto.js";

export const getCategoryApi = async(req:Request,res:Response):Promise<Response | void> =>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(401).json({
                message:"ID is required"
            })
        }
        const category = await CategoryReposistence.findByPk(id);
        if(!category){
            return res.status(401).json({
                message:"don't find category"
            })
        }
        return res.status(201).json({
            data:category,
            message:"Find category is successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}