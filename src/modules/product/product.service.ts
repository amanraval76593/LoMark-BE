import { IProduct } from "./product.interface";
import { ProductRepository } from "./product.repository";


export class ProductService {

    static async addProduct(data: IProduct) {
        return ProductRepository.create(data);
    }

    static async fetchProductForSellerService(sellerId: string, limit: number, cursor: string | undefined) {

        const results = await ProductRepository.fetchBySellerId(sellerId, limit, cursor);

        const hasNextPage = results.length > limit;

        if (hasNextPage) results.pop();

        return {
            productList: results,
            meta: {
                nextCursor: hasNextPage ? results[results.length - 1]._id : null,
                hasNextPage
            }
        }
    }

    static async fetchProductByLocation(limit: number, cursor: string | undefined) {

        const results = await ProductRepository.fetchByLocation(limit, cursor);

        const hasNextPage = results.length > limit;

        if (hasNextPage) results.pop();

        return {
            productList: results,
            meta: {
                nextCursor: hasNextPage ? results[results.length - 1]._id : null,
                hasNextPage
            }
        }
    }

}