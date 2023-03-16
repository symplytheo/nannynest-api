import { Router } from "express";
import {
  changePassword,
  createAdmin,
  createCategory,
  deleteUser,
  getAdminDashboardStats,
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
router.get("/dashboard", isAuthenticated, isAdmin, getAdminDashboardStats);

// categories
router
  .route("/categories")
  .get(isAuthenticated, isAdmin, getAllCategories)
  .post(isAuthenticated, isAdmin, createCategory);
router.put("/categories/:id", isAuthenticated, isAdmin, updateCategory);

// get all orders / transactions
router.get("/orders", isAuthenticated, isAdmin, getAllOrders);
// get order details
router.get("/orders/:id", isAuthenticated, isAdmin, getSingleOrder);
// clients
router.get("/clients", isAuthenticated, isAdmin, getAllClients); // get all clients
router
  .route("/clients/:id")
  .get(isAuthenticated, isAdmin, getSingleUser)
  .put(isAuthenticated, isAdmin, suspendUser)
  .delete(isAuthenticated, isAdmin, deleteUser);
router.get("/clients/:id/orders/", isAuthenticated, isAdmin, getClientOrders); // get a client orders
// nannies
router.get("/nannies", isAuthenticated, isAdmin, getAllNannies);
router
  .route("/nannies/:id")
  .get(isAuthenticated, isAdmin, getSingleUser)
  .put(isAuthenticated, isAdmin, suspendUser)
  .delete(isAuthenticated, isAdmin, deleteUser);
router.get("/nannies/:id/orders", isAuthenticated, isAdmin, getNannyOrders); // get a nanny orders

// admin delete
router.delete("/:id", isAuthenticated, isAdmin, removeAdmin);

const adminRouter = router;

export default adminRouter;
