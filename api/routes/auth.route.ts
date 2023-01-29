import { Router } from "express";
import { getProfile, submitPhoneNumber, updateProfile, verifyOtp } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.post("/", submitPhoneNumber);
router.post("/verify-otp", verifyOtp);
router.route("/me").get(isAuthenticated, getProfile).post(isAuthenticated, updateProfile);

const authRouter = router;

export default authRouter;
