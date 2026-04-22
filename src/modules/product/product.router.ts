import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../auth';
import { ProductController } from './product.controller';
import validate from '../../middleware/validate.middleware';
import { checkProductStockSchema, createProductSchema, fetchProductByIdSchema, fetchProductByLocationSchema, updateProductSchema } from './product.validation';

const router = Router();

router.post('/add-product', authMiddleware, requireRole(UserRole.FARMER), validate(createProductSchema), ProductController.addProduct);
router.patch('/update-product/:productId', authMiddleware, requireRole(UserRole.FARMER), validate(updateProductSchema), ProductController.updateProduct);
router.get('/fetch-seller-products', authMiddleware, requireRole(UserRole.FARMER), ProductController.fetchProductForSeller);
router.get('/fetch-product', authMiddleware, requireRole(UserRole.USER), validate(fetchProductByLocationSchema), ProductController.fetchProductByLocation);
router.get('/fetch-prduct-by-id/:productId',authMiddleware,validate(fetchProductByIdSchema),ProductController.fetchProductById);
router.get('/check-product-stock',authMiddleware,requireRole(UserRole.USER),validate(checkProductStockSchema),ProductController.checkProductStock);

export default router;
