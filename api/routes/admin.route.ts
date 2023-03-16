import { Router } from "express";
import {
  changePassword,
  createAdmin,
  createCategory,
  deleteUser,
  getAllAdmins,
  getAllCategories,
  getAllClients,
  getAllNannies,
  getAllOrders,
  getClientOrders,
  getNannyOrders,
  getProfile,
  getSingleUser,
  loginAdmin,
  removeAdmin,
  suspendUser,
  updateCategory,
  updateProfile,
} from "../controllers/admin.controller";
import { isAdmin, isAuthenticated } from "../middleware";
import { getSingleOrder } from "../controllers/order.controller";

const router = Router();

router.route("/").get(isAuthenticated, isAdmin, getAllAdmins).post(isAuthenticated, isAdmin, createAdmin);
router.route("/me").get(isAuthenticated, isAdmin, getProfile).put(isAuthenticated, isAdmin, updateProfile);
router.post("/login", loginAdmin);
router.post("/password", isAuthenticated, isAdmin, changePassword);

// categories
router.route("/categories").get(getAllCategories).post(isAuthenticated, isAdmin, createCategory);
router.put("/categories/:id", isAuthenticated, isAdmin, updateCategory);

// get all orders / transactions
router.get("/orders", getAllOrders);
// order stats ==> total_trans = orders count, total sales = order completed + ongoing count, totalPayout = ordercompleted
// get order details
router.get("/orders/:id", getSingleOrder);
// clients
router.get("/clients", getAllClients); // get all clients
router.get("/clients/orders/:id", getClientOrders); // get a client orders
router.route("/clients/:id").get(getSingleUser).put(suspendUser).delete(deleteUser);
// nannies
router.get("/nannies", getAllNannies);
router.route("/nannies/:id").get(getSingleUser).put(suspendUser).delete(deleteUser);
router.get("/nannies/orders/:id", getNannyOrders); // get a nanny orders

// admin delete
router.delete("/:id", isAuthenticated, isAdmin, removeAdmin);

const adminRouter = router;

export default adminRouter;
