import { Router } from "express";
import {
  createOrder,
  getAddressBook,
  getReviews,
  getUserOrders,
  reviewNanny,
  updateOrder,
} from "../controllers/order.controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.route("/").get(isAuthenticated, getUserOrders).post(isAuthenticated, createOrder);
router.put("/:id", isAuthenticated, updateOrder);
router.get("/address", isAuthenticated, getAddressBook);
router.route("/reviews").get(isAuthenticated, getReviews).post(isAuthenticated, reviewNanny);

const orderRouter = router;

export default orderRouter;
