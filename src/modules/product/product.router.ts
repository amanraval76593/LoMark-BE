import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { UserRole } from "../auth";
import { ProductController } from "./product.controller";
import validate from "../../middleware/validate.middleware";
import { createProductSchema } from "./product.validation";

const router = Router();

router.post("/add-product", authMiddleware, requireRole(UserRole.FARMER), validate(createProductSchema), ProductController.addProduct);
router.get("/fetch-seller-products", authMiddleware, requireRole(UserRole.FARMER), ProductController.fetchProductForSeller);
router.get("/fetch-product", authMiddleware, requireRole(UserRole.USER), ProductController.fetchProductByLocation)

export default router;