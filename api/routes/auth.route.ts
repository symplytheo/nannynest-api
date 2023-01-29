import { Router } from "express";
import { submitPhoneNumber, verifyOtp } from "../controllers/auth.controller";

const router = Router();

router.post("/", submitPhoneNumber);
router.post("/verify-otp", verifyOtp);

const authRouter = router;

export default authRouter;
