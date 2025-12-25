import { Express } from 'express'
import healthRouter from './health.route'
import { AuthRouter } from '../modules/auth';

export const registerRoutes = (app: Express) => {
    app.use("/", healthRouter);
    app.use("/api/auth", AuthRouter)
}