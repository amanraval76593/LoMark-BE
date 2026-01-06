import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";
import { NotFoundError } from "../../errors/app.error";

export class OrderController {

    static async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) throw new NotFoundError("User Not found");

            const { sellerId, deliveryType, productList } = req.body;
            const response = await OrderService.createOrder({ userId: user.id, deliveryType: deliveryType, productList: productList, sellerId: sellerId });

            res.status(200).json(response);

        } catch (error) {
            next(error);
        }

    }
}