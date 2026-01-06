import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { UserRole } from "../auth";
import { createOrderSchema } from "./order.validation";
import validate from "../../middleware/validate.middleware";
import { OrderController } from "./order.controller";

const orderRouter = Router();

orderRouter.post("/create-order", authMiddleware, requireRole(UserRole.USER), validate(createOrderSchema), OrderController.createOrder)

export default orderRouter;