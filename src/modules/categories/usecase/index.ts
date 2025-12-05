import type { IRepository, ICategoryUseCase } from "../interface/index.js";
import type { CreateCategoryDTO } from "../model/dto.js";
import { v7 } from "uuid";
import type { Category } from "../model/model.js";
import { ModelStatus } from "../../../share/model/base-model.js";

export class CategoryUseCase implements ICategoryUseCase {
    constructor(private readonly repository:IRepository){}

    async CreateANewCategory(data:CreateCategoryDTO){
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
       return true;
    }
}