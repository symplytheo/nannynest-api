/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT,
  DB_URI: process.env.DATABASE_URI!,
  JWT_SECRET: process.env.JWT_SECRET,
  BASE: process.env.BASE,
};

export default config;
