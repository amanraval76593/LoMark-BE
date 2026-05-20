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

    const products = await ProductModel.find(query).sort({ _id: -1 }).limit(limit + 1).lean();

    return products.map((product) => this.withAvailableQuantity(product));
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
          available_quantity: {
            $subtract: [
              '$total_quantity',
              { $add: ['$reserved_quantity', '$sold_quantity'] },
            ],
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

  static async fetchProductByIdAndSellerId(productId: string, sellerId: string) {
    const product = await ProductModel.findOne({ _id: productId, seller_id: sellerId }).lean();

    return product ? this.withAvailableQuantity(product) : null;
  }

  static async checkProductStock(productId:string,quantity:number):Promise<boolean>{
    const product = await ProductModel.findById(productId).lean();

    if(!product) return false;

    return this.getAvailableQuantity(product) >= quantity;
  }

  static async updateByIdAndSellerId(productId: string, sellerId: string, updateData: IUpdateProductInput & { is_available?: boolean }) {
    const query: Record<string, unknown> = { _id: productId, seller_id: sellerId };

    if (typeof updateData.total_quantity === 'number') {
      query.$expr = {
        $gte: [
          updateData.total_quantity,
          { $add: ['$reserved_quantity', '$sold_quantity'] },
        ],
      };
    }

    const product = await ProductModel.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    return product ? this.withAvailableQuantity(product) : null;
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
    session?: ClientSession,
  ) {
    return ProductModel.updateOne(
      {
        _id: productId,
        seller_id: sellerId,
        is_available: true,
        $expr: {
          $gte: [
            { $subtract: ['$total_quantity', { $add: ['$reserved_quantity', '$sold_quantity'] }] },
            quantity,
          ],
        },
      },
      [
        {
          $set: {
            reserved_quantity: { $add: ['$reserved_quantity', quantity] },
            is_available: {
              $gt: [
                { $subtract: ['$total_quantity', { $add: [{ $add: ['$reserved_quantity', quantity] }, '$sold_quantity'] }] },
                0,
              ],
            },
          },
        },
      ],
      session ? { session, updatePipeline: true } : { updatePipeline: true },
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
        reserved_quantity: { $gte: quantity },
      },
      [
        {
          $set: {
            reserved_quantity: { $subtract: ['$reserved_quantity', quantity] },
            is_available: {
              $gt: [
                { $subtract: ['$total_quantity', { $add: [{ $subtract: ['$reserved_quantity', quantity] }, '$sold_quantity'] }] },
                0,
              ],
            },
          },
        },
      ],
      session ? { session, updatePipeline: true } : { updatePipeline: true },
    );
  }

  private static getAvailableQuantity(product: Pick<IProduct, 'total_quantity' | 'reserved_quantity' | 'sold_quantity'>) {
    return product.total_quantity - product.reserved_quantity - product.sold_quantity;
  }

  private static withAvailableQuantity<T extends Pick<IProduct, 'total_quantity' | 'reserved_quantity' | 'sold_quantity'>>(product: T) {
    return {
      ...product,
      available_quantity: this.getAvailableQuantity(product),
    };
  }


}
