import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { UserRole } from "../auth";
import validate from "../../middleware/validate.middleware";
import { assignSellerLocationSchema } from "./seller.validator";
import { SellerController } from "./seller.controller";

const router = Router();

router.post("/create-profile", authMiddleware, requireRole(UserRole.FARMER), validate(assignSellerLocationSchema), SellerController.CreateSellerProfileController);
router.get("/fetch-profile", authMiddleware, requireRole(UserRole.FARMER), SellerController.fetchSellerProfileController);
router.post("/change-location",authMiddleware,requireRole(UserRole.FARMER),SellerController.ChangeSellerLocationController);

export default router;