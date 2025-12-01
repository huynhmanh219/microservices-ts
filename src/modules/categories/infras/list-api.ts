import type { Request, Response } from "express"
import { CategoryReposistence } from "./repository/dto.js";
import z from "zod";
import { Op } from "sequelize";
import { CategoryStatusEnum } from "../model/model.js";


const PagingDTOSchema = z.object({
    page:z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    total: z.coerce.number().int().min(0).default(0).optional(),
});
type PagingDTO = z.infer<typeof PagingDTOSchema>;
export const listGetCategoryApi = async(req:Request,res:Response) =>{
    const {success,data,error} = PagingDTOSchema.safeParse(req.query);
    if(!success){
        return res.status(400).json({
            message:error.message
        });
    }
    const {page,limit} = data;
    const offset = (page - 1) * limit;
    const cond = {status:{[Op.ne]:CategoryStatusEnum.enum.deleted}};
    const total = await CategoryReposistence.count({where:cond});
    const categories = await CategoryReposistence.findAll({
        limit,
        offset,
        order:["id","DESC"]
    });
    data.total = total;
    return res.status(201).json({
        data:categories|| [],
        paging:data
    })
}