import { Request, Response, NextFunction } from "express"
import { UserRole } from "../database"

export const requireRole = (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {

    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access Denied" })
    }

    next();
}