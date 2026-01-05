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

    static async fetchProductForSeller(req: Request, res: Response, next: NextFunction) {
        try {

            const limit = Math.min(Number(req.query.limit || 10), 100)
            const cursor = req.query.cursor as string || undefined
            const user = req.user!;

            const productsList = await ProductService.fetchProductForSellerService(user?.id, limit, cursor);

            return res.status(200).json({
                message: "Product fetched successfully",
                data: productsList
            })

        } catch (error) {
            next(error)
        }
    }

    static async fetchProductByLocation(req: Request, res: Response, next: NextFunction) {

        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const cursor = req.query.cursor as string || undefined;

        const productList = await ProductService.fetchProductByLocation(limit, cursor);

        return res.status(200).json({
            message: "Product Fetched Successfully",
            data: productList
        })
    }
}