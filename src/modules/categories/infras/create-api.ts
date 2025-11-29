import type { Request, Response } from "express";
import { CreateCategorySchema } from "../model/dto.js";
import { CategoryReposistence } from "./repository/dto.js";
import { randomUUID } from "crypto";
import { v7 } from "uuid";

export const createCategoryApi = async(req:Request,res:Response) =>{
   try {
    const {success,data,error} = CreateCategorySchema.safeParse(req.body);
 
    if(!success){
        return res.status(400).json({
            message:error.message
        })
    }

    const newID = v7();
    await CategoryReposistence.create({id:newID,...data});


    return res.status(201).json({
        message:"Category created successfully",
        data:data
    })
    } catch (error) {
        return res.status(500).json({
            message:"Internal server error"
        })
    }

}