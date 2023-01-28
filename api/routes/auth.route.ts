import { Router } from "express";
import { submitPhoneNumber } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/", submitPhoneNumber);

export default authRouter;
