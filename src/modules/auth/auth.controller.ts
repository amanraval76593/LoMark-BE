import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";


export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.registerUser(req.body);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.login(req.body);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    static async profile(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user!;
            res.status(200).json(user);
        } catch (err) {
            next(err)
        }
    }
}