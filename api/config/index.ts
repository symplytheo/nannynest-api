/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT,
  databaseUri: process.env.DATABASE_URI!,
};

export default config;
