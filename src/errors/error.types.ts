// types/error.types.ts
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        statusCode: number;
        errors?: Record<string, string[]>; // For validation errors
        stack?: string; // Only in development
    };
}