import type { IRepository, ICategoryUseCase } from "../interface/index.js";
import type { CategoryConDTO, CreateCategoryDTO, UpdateCategoryDTO } from "../model/dto.js";
import { v7 } from "uuid";
import type { Category } from "../model/model.js";
import { ModelStatus } from "../../../share/model/base-model.js";
import type { PagingDTO } from "../../../share/model/paging.js";
import { ErrDataNotFound } from "../../../share/model/base-error.js";

export class CategoryUseCase implements ICategoryUseCase {
    constructor(private readonly repository:IRepository){}
    
    async getDetailCategory(id: string): Promise<Category | null> {
        const data = await this.repository.get(id);
   
        if(!data || data.status === ModelStatus.DELETED){
            throw ErrDataNotFound;
        }
   
        return data;
    }
    async UpdateCategory(id: string, data: UpdateCategoryDTO): Promise<boolean> {
        const category = await this.repository.get(id);
        if(!category || category.status === ModelStatus.DELETED){
            throw ErrDataNotFound;
        }
        
        return await this.repository.update(id,data);
    }
    async DeleteCategory(id: string,isHard:boolean = false): Promise<boolean> {
        const category = await this.repository.get(id);
        if(!category || category.status === ModelStatus.DELETED){
            throw ErrDataNotFound;
        }
        return await this.repository.delete(id,isHard);
    }
    async ListCategory(cond: CategoryConDTO, paging: PagingDTO): Promise<Array<Category>> {
        const data = await this.repository.list(cond,paging);
        return data;    
    }

    async CreateANewCategory(data:CreateCategoryDTO):Promise<string>{
        const newID = v7();
        const category:Category={
            id:newID,
            name:data.name,
            image:data.image,
            position:data.position,
            description:data.description,
            parent_id:data.parent_id,
            status:ModelStatus.ACTIVE,
            created_at:new Date(),
            updated_at:new Date()
        }
       await this.repository.insert(category);
       return newID;
    }
}