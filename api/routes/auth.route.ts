import { Router } from "express";
import { getAllUsers, getProfile, submitPhoneNumber, updateProfile, verifyOtp } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.post("/", submitPhoneNumber);
router.post("/verify-otp", verifyOtp);
router.get("/all", getAllUsers);
router.route("/me").get(isAuthenticated, getProfile).post(isAuthenticated, updateProfile);

const authRouter = router;

export default authRouter;
