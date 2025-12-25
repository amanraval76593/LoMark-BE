import { Router, Request, Response } from 'express';

const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
    })
});

export default healthRouter;

