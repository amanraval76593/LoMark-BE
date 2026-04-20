import { BadRequestError } from "../../errors/app.error";
import { SellerRepository } from "../seller/seller.repository";
import { ICreateProductInput, IProduct } from "./product.interface";
import { ProductRepository } from "./product.repository";


export class ProductService {

    static async addProduct(sellerId: string, data: ICreateProductInput) {
        const sellerProfile = await SellerRepository.fetchSellerProfile(sellerId);

        if (!sellerProfile) {
            throw new BadRequestError("Seller profile not found. Please complete seller profile first.");
        }

        const productData: Omit<IProduct, "created_at" | "updated_at"> = {
            name: data.name,
            category: data.category,
            description:data.description,
            price: data.price,
            quantity: data.quantity,
            seller_id: sellerId,
            is_available: data.is_available ?? data.quantity > 0,
            seller: {
                location: {
                    type: "Point",
                    coordinates: [sellerProfile.longitude, sellerProfile.latitude]
                },
                delivery_radius_km: sellerProfile.delivery_radius_km
            },
            rating: {
                avg: 0,
                count: 0
            }
        };

        return ProductRepository.create(productData);
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

    static async fetchProductByLocation(longitude:number,latitude:number,limit: number, cursor: string | undefined) {

        const results = await ProductRepository.fetchByLocation(longitude,latitude,limit, cursor);

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

    static async checkProductStock(productId:string,quantity:number){

        const result=await ProductRepository.checkProductStock(productId,quantity);

        return {
            stockAvailable:result
        }
    }

}
