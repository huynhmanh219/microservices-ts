// có thể dùng database ORM khác nhau 
import {DataTypes, Model , Sequelize} from "sequelize";
import type { CategoryStatus } from "../../model/model.js";

export class CategoryReposistence extends Model{
    declare id:string;
    declare status:CategoryStatus
}

export const modelName = "Category";
export function init(sequelize:Sequelize){
    CategoryReposistence.init({
        id:{
            type:DataTypes.STRING,
            primaryKey:true,
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        image:{
            type:DataTypes.STRING,
            allowNull:true
        },
        parent_id:{
            type:DataTypes.STRING,
            allowNull:true,
            field:"parent_id"
        },
        description:{
            type:DataTypes.STRING,
            allowNull:true
        },
        status:{
            type:DataTypes.ENUM("active","inactive","deleted"),
            allowNull:false,
            defaultValue:"active"
        }
    },
    {
        sequelize,
        modelName:modelName,
        createdAt:"created_at",
        updatedAt:"updated_at",
        tableName:"categories",
        timestamps:true
    }
)
}