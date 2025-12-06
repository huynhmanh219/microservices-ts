import { Op, type Sequelize } from "sequelize";
import type { IRepository } from "../../interface/index.js";
import type { PagingDTO } from "../../../../share/model/paging.js";
import type { CategoryConDTO, UpdateCategoryDTO } from "../../model/dto.js";
import { CategorySchema, type Category } from "../../model/model.js";
import { ModelStatus } from "../../../../share/model/base-model.js";


// implement ORM here
export class MySQLCategoryRepository implements IRepository{
    constructor(private readonly sequenlize:Sequelize,private readonly modelName:string){}

    async get(id: string): Promise<Category | null> {
        const data = await this.sequenlize.models[this.modelName]?.findByPk(id);
        if(!data) return null;

        return CategorySchema.parse(data.get({plain:true}));
    }
    async list(cond: CategoryConDTO, paging: PagingDTO): Promise<Array<Category>> {
        const {page,limit}= paging;
        const conSQL = {...cond,status:{[Op.ne]:ModelStatus.DELETED}};
        const total= await this.sequenlize.models[this.modelName]?.count({where:conSQL});
        paging.total = total;
        const rows = await this.sequenlize.models[this.modelName]?.findAll({
            where:conSQL,
            limit,
            offset: (page - 1) * limit,
            order:["id","DESC"]
        });
        return rows?.map(row => row.get({plain:true})) || [];
    }
    async insert(data: Category): Promise<boolean> {
      const result = await this.sequenlize.models[this.modelName]?.create(data);
      return result ? true : false;
    }
    async update(id: string, data: UpdateCategoryDTO): Promise<boolean> {
        const result = await this.sequenlize.models[this.modelName]?.update(data,{where:{id}});
        if(!result) return false;
        return true;
    }
    async delete(id: string,isHard:boolean = false): Promise<boolean> {
        if(isHard == true){
            const result = await this.sequenlize.models[this.modelName]?.destroy({where:{id}});
            return result ? true : false;
        }
        const result = await this.sequenlize.models[this.modelName]?.update({status:ModelStatus.DELETED},{where:{id}});
        return result ? true : false;
    }
}