import express from 'express'
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

app.use(express.json());

app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
        const color = res.statusCode < 400 ? GREEN : RED;
        console.log(`${color}${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms${RESET}`);
    });

    next();
});

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
