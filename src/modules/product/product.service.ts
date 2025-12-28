import { IProduct } from "./product.interface";
import { ProductRepository } from "./product.repository";


export class ProductService {

    static async addProduct(data: IProduct) {
        return ProductRepository.create(data);
    }

}