import { Router } from "express";
import {
  addPaymentBank,
  addPaymentCard,
  getNannyDashboardStats,
  getPaymentBanks,
  getPaymentCards,
  getProfile,
  setActivePaymentBank,
  setActivePaymentCard,
  submitPhoneNumber,
  updateProfile,
  verifyOtp,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware";

const router = Router();

router.post("/", submitPhoneNumber);
router.post("/verify-otp", verifyOtp);
router.route("/me").get(isAuthenticated, getProfile).post(isAuthenticated, updateProfile);
router.route("/cards").get(isAuthenticated, getPaymentCards).post(isAuthenticated, addPaymentCard);
router.put("/cards/:id", isAuthenticated, setActivePaymentCard);
router.route("/banks").get(isAuthenticated, getPaymentBanks).post(isAuthenticated, addPaymentBank);
router.put("/banks/:id", isAuthenticated, setActivePaymentBank);
router.get("/dashboard", isAuthenticated, getNannyDashboardStats);

const authRouter = router;

export default authRouter;
