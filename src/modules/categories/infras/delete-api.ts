import type { Request, Response } from "express";

export const deleteCategoryApi = async(req:Request,res:Response):Promise<void> =>{
    res.status(201).json({
        message:"",
        data:[]
    })
}