import { Router } from "express";
import { createCategory, getAllCategories, updateCategory } from "../controllers/admin.controller";

const router = Router();

router.route("/categories").get(getAllCategories).post(createCategory);
router.put("/categories/:id", updateCategory);

const adminRouter = router;

export default adminRouter;
