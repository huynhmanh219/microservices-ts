import type { PagingDTO } from "../../../share/model/paging.js";
import type { CategoryConDTO, CreateCategoryDTO, UpdateCategoryDTO } from "../model/dto.js";
import type { Category } from "../model/model.js";

export interface ICategoryUseCase{
    CreateANewCategory(data:CreateCategoryDTO):Promise<string>;
    getDetailCategory(id:string):Promise<Category | null>;
    UpdateCategory(id:string,data:UpdateCategoryDTO):Promise<boolean>;
    DeleteCategory(id:string):Promise<boolean>;
    ListCategory(cond:CategoryConDTO,paging:PagingDTO):Promise<Array<Category>>;
}

export interface IRepository extends IQueryRepository,ICommandRepository{

}

export interface IQueryRepository{
    get(id:string):Promise<Category | null>
    list(cond:CategoryConDTO,paging:PagingDTO):Promise<Array<Category>>
}

export interface ICommandRepository{
    insert(data:Category):Promise<boolean>
    update(id:string,data:UpdateCategoryDTO):Promise<boolean>
    delete(id:string,isHard:boolean):Promise<boolean>
}