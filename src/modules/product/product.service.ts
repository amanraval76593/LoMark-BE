import { BadRequestError, NotFoundError } from '../../errors/app.error';
import { SellerRepository } from '../seller/seller.repository';
import type { ICreateProductInput, IProduct, IUpdateProductInput } from './product.interface';
import { ProductRepository } from './product.repository';


export class ProductService {

  static async addProduct(sellerId: string, data: ICreateProductInput) {
    const sellerProfile = await SellerRepository.fetchSellerProfile(sellerId);

    if (!sellerProfile) {
      throw new BadRequestError('Seller profile not found. Please complete seller profile first.');
    }

    const productData: Omit<IProduct, 'created_at' | 'updated_at'> = {
      name: data.name,
      category: data.category,
      description:data.description,
      price: data.price,
      quantity: data.quantity,
      quantity_unit:data.quantity_unit,
      seller_id: sellerId,
      is_available: data.is_available ?? data.quantity > 0,
      seller: {
        location: {
          type: 'Point',
          coordinates: [sellerProfile.longitude, sellerProfile.latitude],
        },
        delivery_radius_km: sellerProfile.delivery_radius_km,
      },
      rating: {
        avg: 0,
        count: 0,
      },
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
        hasNextPage,
      },
    };
  }

  static async fetchProductByLocation(longitude:number,latitude:number,limit: number, cursor: string | undefined) {

    const results = await ProductRepository.fetchByLocation(longitude,latitude,limit, cursor);

    const hasNextPage = results.length > limit;

    if (hasNextPage) results.pop();

    return {
      productList: results,
      meta: {
        nextCursor: hasNextPage ? results[results.length - 1]._id : null,
        hasNextPage,
      },
    };
  }

  static async fetchProductById(productId:string){

    const product=await ProductRepository.fetchProductById(productId);

    if(!product){
      throw new BadRequestError('No product record found');
    }

    return product;

  }
  static async checkProductStock(productId:string,quantity:number){

    const result=await ProductRepository.checkProductStock(productId,quantity);

    return {
      stockAvailable:result,
    };
  }

  static async updateProduct(sellerId: string, productId: string, data: IUpdateProductInput) {
    const updateData: IUpdateProductInput & { is_available?: boolean } = { ...data };

    if (typeof data.quantity === 'number') {
      updateData.is_available = data.quantity > 0;
    }

    const updatedProduct = await ProductRepository.updateByIdAndSellerId(productId, sellerId, updateData);

    if (!updatedProduct) {
      throw new NotFoundError('Product not found for this farmer');
    }

    return updatedProduct;
  }

}
