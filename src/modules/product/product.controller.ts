import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import { ICreateProductInput, IUpdateProductInput } from "./product.interface";

export class ProductController {

    static async addProduct(req: Request, res: Response, next: NextFunction) {
        try {

            const user = req.user!;

            const productPayload: ICreateProductInput = {
                name: req.body.name,
                category: String(req.body.category).toLowerCase() as ICreateProductInput["category"],
                description:req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                quantity_unit:req.body.quantity_unit,
                is_available: req.body.is_available
            };

            const product = await ProductService.addProduct(user.id, productPayload);

            return res.status(200).json({
                message: "Product Added Successfully",
                product,
            })

        } catch (error) {
            next(error);
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
            next(error);
        }
    }

    static async fetchProductByLocation(req: Request, res: Response, next: NextFunction) {

        try{
            const limit = Math.min(Number(req.query.limit) || 10, 100);
            const cursor = req.query.cursor as string || undefined;

            const latitude = Number(req.query.latitude);
            const longitude = Number(req.query.longitude);

            const productList = await ProductService.fetchProductByLocation(longitude, latitude, limit, cursor);

            return res.status(200).json({
                message: "Product Fetched Successfully",
                data: productList
            });
        }catch(error){
            next(error);
        }
    }

    static async checkProductStock(req:Request,res:Response,next:NextFunction){
        try{   

            const {productId,quantity}=req.body;

            const response=await ProductService.checkProductStock(productId,quantity);

            return res.status(200).json({
                data:response
            });

        }catch(error){
            next(error);
        }
    }

    static async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user!;
            const { productId } = req.params;

            const updatePayload: IUpdateProductInput = {
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                quantity_unit: req.body.quantity_unit ? String(req.body.quantity_unit).toLowerCase() as IUpdateProductInput["quantity_unit"] : undefined,
            };

            const updatedProduct = await ProductService.updateProduct(user.id, productId, updatePayload);

            return res.status(200).json({
                message: "Product updated successfully",
                product: updatedProduct,
            });
        } catch (error) {
            next(error);
        }
    }
}
