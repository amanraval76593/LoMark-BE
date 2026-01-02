import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";


export class ProductRepository {

    static async create(product: IProduct) {
        return ProductModel.create(product)
    }

    static async fetchBySellerId(sellerId: string, limit: number, cursor: string | undefined) {

        const query = cursor ? { _id: { $lt: cursor }, sellerId: sellerId } : { sellerId: sellerId };

        return ProductModel.find(query).sort({ _id: -1 }).limit(limit + 1);
    }

    static async fetchByLocation(limit: number, cursor: string | undefined) {

        const query = cursor ? { _id: { $lt: cursor } } : {};

        return ProductModel.find(query);
    }

}