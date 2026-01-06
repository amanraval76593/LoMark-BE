import { Express } from 'express'
import healthRouter from './health.route'
import { AuthRouter } from '../modules/auth';
import { ProductRouter } from '../modules/product';
import { OrderRouter } from '../modules/orders';

export const registerRoutes = (app: Express) => {
    app.use("/", healthRouter);
    app.use("/api/auth", AuthRouter);
    app.use("/api/product", ProductRouter);
    app.use("/api/order", OrderRouter);
}