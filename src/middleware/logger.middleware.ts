import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

const getStatusColor = (statusCode: number) => {
    if (statusCode >= 500) return RED
    if (statusCode >= 400) return YELLOW
    return GREEN
}

const getClientIp = (req: Request) => {
    const forwardedFor = req.headers['x-forwarded-for']

    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0]?.trim() || req.ip || 'unknown'
    }

    return req.ip || req.socket.remoteAddress || 'unknown'
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = randomUUID().slice(0, 8)
    const startedAt = Date.now()
    const timestamp = new Date().toISOString()
    const clientIp = getClientIp(req)
    const userAgent = req.get('user-agent') || 'unknown'

    console.log(
        `${CYAN}[${timestamp}] [${requestId}] Incoming ${req.method} ${req.originalUrl} ip=${clientIp} ua="${userAgent}"${RESET}`
    )

    res.on('finish', () => {
        const duration = Date.now() - startedAt
        const statusColor = getStatusColor(res.statusCode)
        const contentLength = res.getHeader('content-length') || '0'

        console.log(
            `${statusColor}[${new Date().toISOString()}] [${requestId}] Completed ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${duration}ms size=${contentLength}${RESET}`
        )
    })

    next()
}
