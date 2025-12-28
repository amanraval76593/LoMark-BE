import { Router } from "express";
import { LoginSchema, RegisterSchema } from "./auth.validation";
import { AuthController } from "./auth.controller";
import validate from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { UserRole } from "./auth.type";

const router = Router()

router.post("/register", validate(RegisterSchema), AuthController.register)
router.post("/login", authMiddleware, requireRole(UserRole.USER), validate(LoginSchema), AuthController.login)

export default router;