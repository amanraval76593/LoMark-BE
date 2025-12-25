import { Express } from 'express'
import healthRouter from './health.route'

export const registerRoutes = (app: Express) => {
    app.use("/", healthRouter);
}