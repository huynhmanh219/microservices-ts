import { Sequelize, type Dialect } from 'sequelize';
import { config } from 'dotenv';
config();

export const sequelize = new Sequelize({
  dialect: process.env.DB_TYPE as Dialect,
  database: process.env.DB_NAME || "",
  username: process.env.DB_USERNAME || "",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "",
  port: parseInt(process.env.DB_PORT as string),
  pool:{
    max:20,
    min:2,
    acquire:30000,
    idle:60000
  },
  logging:false
}); 