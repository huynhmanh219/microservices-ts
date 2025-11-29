import { Router } from "express"
import { getCategoryApi } from "./infras/get-api.js";
import { updateCategoryApi } from "./infras/update-api.js";
import { listGetCategoryApi } from "./infras/list-api.js";
import { createCategoryApi } from "./infras/create-api.js";
import { deleteCategoryApi } from "./infras/delete-api.js";
import { init } from "./infras/repository/dto.js";
import type { Sequelize } from "sequelize";

export const setUpCategoryModule = (sequelize:Sequelize)=>{
    const router = Router();
    init(sequelize);

    router.get("/categories",listGetCategoryApi);
    router.get("/categories/:id",getCategoryApi);
    router.post("/categories",createCategoryApi);
    router.patch("/categories/:id",updateCategoryApi);
    router.delete("/categories/:id",deleteCategoryApi);
    return router;
}