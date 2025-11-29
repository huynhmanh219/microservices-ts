import type { Request, Response } from "express";

export const getCategoryApi = async(req:Request,res:Response):Promise<void> =>{
    try {
        const {id} = req.params;
    } catch (error) {
        
    }
    res.status(201).json({
        message:"",
        data:[]
    })
}