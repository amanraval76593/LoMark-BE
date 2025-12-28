import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";


export class ProductRepository {

    static async create(product: IProduct) {
        return ProductModel.create(product)
    }

}