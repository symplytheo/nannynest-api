import { Router } from "express";
import {
  createOrder,
  getAddressBook,
  getReviews,
  getSingleOrder,
  getUserOrders,
  reviewNanny,
  updateOrder,
} from "../controllers/order.controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.route("/").get(isAuthenticated, getUserOrders).post(isAuthenticated, createOrder);
router.route("/reviews").get(isAuthenticated, getReviews).post(isAuthenticated, reviewNanny);
router.get("/address", isAuthenticated, getAddressBook);
router.route("/:id").get(getSingleOrder).put(isAuthenticated, updateOrder);

const orderRouter = router;

export default orderRouter;
