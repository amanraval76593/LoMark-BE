import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../auth';
import { createOrderSchema, fetchOrderByIdSchema } from './order.validation';
import validate from '../../middleware/validate.middleware';
import { OrderController } from './order.controller';

const orderRouter = Router();

orderRouter.post('/create-order', authMiddleware, requireRole(UserRole.USER), validate(createOrderSchema), OrderController.createOrder);
orderRouter.get('/get-order-by-id/:orderId',authMiddleware,validate(fetchOrderByIdSchema),OrderController.fetchOrderDetailsById);
orderRouter.get('/get-orders-for-user',authMiddleware,requireRole(UserRole.USER),OrderController.fetchOrderForUser);
orderRouter.get('/get-orders-for-seller',authMiddleware,requireRole(UserRole.FARMER),OrderController.fetchOrderForSeller);

export default orderRouter;