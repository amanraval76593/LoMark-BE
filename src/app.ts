import express from 'express'
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(express.json());

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