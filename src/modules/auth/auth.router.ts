import { Router } from "express";
import { LoginSchema, RegisterSchema } from "./auth.validation";
import { AuthController } from "./auth.controller";
import validate from "../../middleware/validate.middleware";

const router = Router()

router.post("/register", validate(RegisterSchema), AuthController.register)
router.post("/login", validate(LoginSchema), AuthController.login)

export default router;