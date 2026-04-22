import type { ClientSession } from 'mongoose';
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

  static async fetchProductById(productId:string){
    const product=ProductModel.findById(productId);

    return product;
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
      { new: true, runValidators: true },
    ).lean();
  }

  static async fetchByIdsAndSellerId(productIds: string[], sellerId: string, session?: ClientSession) {
    const query = ProductModel.find({
      _id: { $in: productIds },
      seller_id: sellerId,
    });

    if (session) {
      query.session(session);
    }

    return query.lean();
  }

  static async deductInventory(
    productId: string,
    sellerId: string,
    quantity: number,
    nextAvailability: boolean,
    session?: ClientSession,
  ) {
    return ProductModel.updateOne(
      {
        _id: productId,
        seller_id: sellerId,
        is_available: true,
        quantity: { $gte: quantity },
      },
      {
        $inc: { quantity: -quantity },
        $set: { is_available: nextAvailability },
      },
      session ? { session } : undefined,
    );
  }

  static async restoreInventory(
    productId: string,
    sellerId: string,
    quantity: number,
    session?: ClientSession,
  ) {
    return ProductModel.updateOne(
      {
        _id: productId,
        seller_id: sellerId,
      },
      {
        $inc: { quantity: quantity },
        $set: { is_available: (quantity > 0) },
      },
      session ? { session } : undefined,
    );
  }


}
