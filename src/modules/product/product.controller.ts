import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";

export class ProductController {

    static async addProduct(req: Request, res: Response, next: NextFunction) {
        try {

            const user = req.user!;

            const product = await ProductService.addProduct({
                ...req.body,
                sellerId: user.id,
                isActive: true
            });

            return res.status(200).json({
                message: "Product Added Successfully",
                product,
            })

        } catch (error) {
            next(error)
        }

    }
}