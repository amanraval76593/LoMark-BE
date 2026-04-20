import express from 'express'
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

app.use(express.json());
app.use(requestLogger);

registerRoutes(app);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND',
            statusCode: 404
        }
    });
});

app.use(errorHandler);
export { app };
