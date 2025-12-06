import express from "express";
import { config } from "dotenv";
import { sequelize } from "./share/component/sequezile.js";
import type { Error } from "sequelize";
import { SetUpCategoryHTTPModuleHexagon } from "./modules/categories/index.js";
const port = process.env.PORT || 3000;

config();
const db = async ()=>{
    await sequelize.authenticate();
    console.log("Connection has been established successfully.")
    const app = express();
        

    app.use(express.json());

    app.use("/api/v1",SetUpCategoryHTTPModuleHexagon(sequelize));

    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })

}

db().then(()=>{
    console.log("Database connected successfully.")
}).catch((err:Error | null)=>{
    console.log("Database connection failed.",err)
})



