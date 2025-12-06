import { Router } from "express"

import { init, modelName } from "./infras/repository/dto.js";
import type { Sequelize } from "sequelize";
import { CategoryHttpService } from "./infras/transport/http-service.js";
import { CategoryUseCase } from "./usecase/index.js";
import { MySQLCategoryRepository } from "./infras/repository/repo.js";

export const SetUpCategoryHTTPModuleHexagon = (sequelize:Sequelize)=>{
    const router = Router();
    init(sequelize);

    const repository = new MySQLCategoryRepository(sequelize,modelName);
    const useCase = new CategoryUseCase(repository);
    const httpService = new CategoryHttpService(useCase);

    router.post("/categories",httpService.CreateANewCategoryAPI.bind(httpService));
    router.get("/categories/:id",httpService.getDetailCategoryAPI.bind(httpService));
    router.patch("/categories/:id",httpService.updateCategoryAPI.bind(httpService));
    router.delete("/categories/:id",httpService.deleteCategoryAPI.bind(httpService));
    router.get("/categories",httpService.listCategoryAPI.bind(httpService));
    return router;
}