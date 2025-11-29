import express, { type Request, type Response } from "express";
import { config } from "dotenv";
import { z } from "zod";
import { CategoryStatusEnum } from "./modules/categories/model/model.js";
import { CreateCategorySchema, UpdateCategorySchema } from "./modules/categories/model/dto.js";
import { setUpCategoryModule } from "./modules/categories/index.js";
import { sequelize } from "./share/component/sequezile.js";
import type { Error } from "sequelize";
const port = process.env.PORT || 3000;

config();
const db = async ()=>{
    await sequelize.authenticate();
    console.log("Connection has been established successfully.")
    const app = express();
    

    app.use(express.json());

    app.use("/api/v1",setUpCategoryModule(sequelize));

    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })

}

db().then(()=>{
    console.log("Database connected successfully.")
}).catch((err:Error | null)=>{
    console.log("Database connection failed.",err)
})



