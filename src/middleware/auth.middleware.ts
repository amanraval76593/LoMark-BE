import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/app.error";
import jwt from "jsonwebtoken"
import config from "../config";
import { JwtPayload } from "../modules/auth";
import { AuthRepository } from "../modules/auth/auth.repository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            throw new UnauthorizedError("Authoriztion token is missing")
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

        const user = await AuthRepository.findUserById(decoded.userId);

        if (!user || !user.is_active) return res.status(401).json({ message: "User not authorized" })

        const { password_hash, is_email_verified, is_active, created_at, updated_at, ...safeUser } = user;

        req.user = safeUser;

        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }



}