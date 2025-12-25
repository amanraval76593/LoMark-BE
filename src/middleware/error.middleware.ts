import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from '../errors/app.error'
import { ErrorResponse } from '../errors/error.types';
export const errorMiddleware = (err: any, req: Request, _res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        return _res.status(400).json({
            message: "Validation Error",
            error: err.issues
        });
    }

    return _res.status(500).json({
        message: err.message || "Internal Server Error"

    })
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    let statusCode = 500;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_ERROR';
    let errors: Record<string, string[]> | undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code || 'APP_ERROR';

        if ('errors' in err) {
            errors = (err as any).errors;
        }
    }

    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            message,
            code,
            statusCode,
            ...(errors && { errors }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    };

    res.status(statusCode).json(errorResponse);
};