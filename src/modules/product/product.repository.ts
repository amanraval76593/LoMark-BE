import mongoose from 'mongoose';
import type { IProduct, IUpdateProductInput } from './product.interface';
import { ProductModel } from './product.model';


export class ProductRepository {

  static async create(product: Omit<IProduct, 'created_at' | 'updated_at'>) {
    return ProductModel.create(product);
  }

  static async fetchBySellerId(sellerId: string, limit: number, cursor: string | undefined) {

    const objectIdCursor = cursor && mongoose.Types.ObjectId.isValid(cursor)
      ? new mongoose.Types.ObjectId(cursor)
      : undefined;
    const query = objectIdCursor ? { _id: { $lt: objectIdCursor }, seller_id: sellerId } : { seller_id: sellerId };

    return ProductModel.find(query).sort({ _id: -1 }).limit(limit + 1).lean();
  }

  static async fetchByLocation(longitude:number,latitude:number,limit: number, cursor: string | undefined) {

    const objectIdCursor = cursor && mongoose.Types.ObjectId.isValid(cursor)
      ? new mongoose.Types.ObjectId(cursor)
      : undefined;
    const query = objectIdCursor ? { _id: { $lt: objectIdCursor }, is_available: true } : { is_available: true };

    return ProductModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distance_meters',
          spherical: true,
          query,
          key: 'seller.location',
        },
      },
      {
        $addFields: {
          distance_km: {
            $divide: ['$distance_meters', 1000],
          },
        },
      },
      {
        $match: {
          $expr: {
            $lte: ['$distance_km', '$seller.delivery_radius_km'],
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: limit + 1,
      },
    ]);
  }

  static async checkProductStock(productId:string,quantity:number):Promise<boolean>{
    const product = await ProductModel.findById(productId).lean();

    if(!product) return false;

    return product.quantity >= quantity;
  }

  static async updateByIdAndSellerId(productId: string, sellerId: string, updateData: IUpdateProductInput & { is_available?: boolean }) {
    return ProductModel.findOneAndUpdate(
      { _id: productId, seller_id: sellerId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }


}
