import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { UserRole } from "../auth";
import validate from "../../middleware/validate.middleware";
import { assignSellerLocationSchema } from "./user.validator";
import { UserController } from "./user.controller";

const router = Router();

router.post("/assign-seller-location", authMiddleware, requireRole(UserRole.FARMER), validate(assignSellerLocationSchema), UserController.assignSellerLocation);
router.get("/fetch-seller-location", authMiddleware, requireRole(UserRole.FARMER), UserController.fetchSellerLocation);

export default router;