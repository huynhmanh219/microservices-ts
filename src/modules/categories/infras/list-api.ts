import type { Request, Response } from "express"

export const listGetCategoryApi = async(req:Request,res:Response):Promise<void> =>{
    res.status(201).json({
        message:"",
        data:[]
    })
}