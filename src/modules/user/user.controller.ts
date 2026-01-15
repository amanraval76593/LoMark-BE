import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

export class UserController {

    static async assignSellerLocation(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;

            const { longitude, latitude } = req.body;
            const response = UserService.assignLocationToSeller(user, longitude, latitude);

            res.status(200).json({ response });

        } catch (error) {
            next(error);
        }
    }

    static async fetchSellerLocation(req: Request, res: Response, next: NextFunction) {
        try {

            const user = req.user;

            const response = UserService.fetchSellerLocation(user);

            res.status(200).json({ response });


        } catch (error) {
            next(error);
        }
    }
}