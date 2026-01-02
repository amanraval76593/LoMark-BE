import { Router } from "express";
import { LoginSchema, RegisterSchema } from "./auth.validation";
import { AuthController } from "./auth.controller";
import validate from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { UserRole } from "./auth.type";

const router = Router()

router.post("/register", validate(RegisterSchema), AuthController.register)
router.post("/login", authMiddleware, validate(LoginSchema), AuthController.login)
router.get("/profile", authMiddleware, AuthController.profile)

export default router;