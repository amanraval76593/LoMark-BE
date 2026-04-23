import mongoose from 'mongoose';
import type { ClientSession } from 'mongoose';
import type { PoolClient } from 'pg';
import { BadRequestError, NotFoundError } from '../../errors/app.error';
import { ProductRepository } from '../product/product.repository';
import type { orderDTO, ProductDTO } from './order.interface';
import { orderRepository } from './order.repository';
import { OrderStatus } from './order.type';

type ReservedProduct = { id: string; quantity: number };
type ProductDoc = Awaited<ReturnType<typeof ProductRepository.fetchByIdsAndSellerId>>[number];

export class OrderService {

  static async createOrder(data: orderDTO) {
    const normalizedProductList = this.mergeProductQuantities(data.productList);

    if (normalizedProductList.length === 0) {
      throw new BadRequestError('At least one product is required');
    }

    const expiredTime = new Date(Date.now() + (60 * 60 * 1000));
    const mongoSession = await mongoose.startSession();
    let deductedProducts: ReservedProduct[] = [];

    try {
      let orderSummary;

      try {
        orderSummary = await mongoSession.withTransaction(async () => this.processOrderCreation(
          data,
          normalizedProductList,
          expiredTime,
          (reservedProducts) => {
            deductedProducts = reservedProducts;
          },
          mongoSession,
        ));
      } catch (error) {
        if (!this.isMongoTransactionNotSupported(error)) {
          throw error;
        }

        orderSummary = await this.processOrderCreation(
          data,
          normalizedProductList,
          expiredTime,
          (reservedProducts) => {
            deductedProducts = reservedProducts;
          },
        );
      }

      if (!orderSummary) {
        throw new NotFoundError('Order creation failed');
      }

      return orderSummary;
    } catch (error) {
      if (deductedProducts.length > 0) {
        await this.restoreDeductedInventory(data.sellerId, deductedProducts);
      }

      throw error;
    } finally {
      await mongoSession.endSession();
    }
  }

  private static async processOrderCreation(
    data: orderDTO,
    normalizedProductList: ReservedProduct[],
    expiredTime: Date,
    setDeductedProducts: (products: ReservedProduct[]) => void,
    session?: ClientSession,
  ) {
    const productIds = normalizedProductList.map((product) => product.id);
    const products = await ProductRepository.fetchByIdsAndSellerId(productIds, data.sellerId, session);

    if (products.length !== productIds.length) {
      throw new BadRequestError('All products must belong to one seller');
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    this.validateBuyerWithinDeliveryRadius(products[0], data.buyerLocation.latitude, data.buyerLocation.longitude);
    let totalPrice = 0;

    for (const requestedProduct of normalizedProductList) {
      const product = productMap.get(requestedProduct.id);

      if (!product) {
        throw new BadRequestError(`Product ${requestedProduct.id} not found`);
      }

      if (!product.is_available || product.quantity < requestedProduct.quantity) {
        throw new BadRequestError(`Product ${requestedProduct.id} does not have enough stock`);
      }

      totalPrice += Number(product.price) * requestedProduct.quantity;
    }
    const actuallyDeducted: ReservedProduct[] = [];
    for (const requestedProduct of normalizedProductList) {
      const product = productMap.get(requestedProduct.id)!;
      const remainingQuantity = product.quantity - requestedProduct.quantity;
      const updateResult = await ProductRepository.deductInventory(
        requestedProduct.id,
        data.sellerId,
        requestedProduct.quantity,
        remainingQuantity > 0,
        session,
      );

      if (updateResult.modifiedCount !== 1) {
        throw new BadRequestError(`Unable to reserve inventory for product ${requestedProduct.id}`);
      }
      actuallyDeducted.push({
        id: requestedProduct.id,
        quantity: requestedProduct.quantity,
      });
    }

    setDeductedProducts(actuallyDeducted);

    return this.createPostgresOrder(data, normalizedProductList, expiredTime, productMap, totalPrice);
  }

  private static async createPostgresOrder(
    data: orderDTO,
    normalizedProductList: ReservedProduct[],
    expiredTime: Date,
    productMap: Map<string, ProductDoc>,
    totalPrice: number,
  ) {
    const client: PoolClient = await orderRepository.getClient();

    try {
      await client.query('BEGIN');

      const order = await orderRepository.createOrder({
        userId: data.userId,
        sellerId: data.sellerId,
        deliveryType: data.deliveryType,
        totalAmount: totalPrice,
        expiredAt: expiredTime,
        status: OrderStatus.REQUESTED,
      }, client);

      if (!order) {
        throw new NotFoundError('Failed to create order');
      }

      for (const requestedProduct of normalizedProductList) {
        const product = productMap.get(requestedProduct.id)!;

        await orderRepository.addProduct({
          id: requestedProduct.id,
          orderId: order.id,
          name: product.name,
          price: Number(product.price),
          quantity: requestedProduct.quantity,
        }, client);
      }

      await client.query('COMMIT');

      return {
        orderId: order.id,
        orderStatus: order.status,
        totalPrice: Number(order.total_amount),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static mergeProductQuantities(productList: ProductDTO[]) {
    const mergedProducts = new Map<string, number>();

    for (const product of productList) {
      mergedProducts.set(product.id, (mergedProducts.get(product.id) ?? 0) + product.quantity);
    }

    return Array.from(mergedProducts.entries()).map(([id, quantity]) => ({ id, quantity }));
  }

  private static async restoreDeductedInventory(
    sellerId: string,
    deductedProducts: ReservedProduct[],
  ) {
    for (const product of deductedProducts) {
      await ProductRepository.restoreInventory(product.id, sellerId, product.quantity);
    }
  }

  private static isMongoTransactionNotSupported(error: unknown) {
    return typeof error === 'object'
      && error !== null
      && 'code' in error
      && error.code === 20;
  }

  private static validateBuyerWithinDeliveryRadius(
    product: ProductDoc,
    buyerLatitude: number,
    buyerLongitude: number,
  ) {
    const [sellerLongitude, sellerLatitude] = product.seller.location.coordinates;
    const distanceKm = this.calculateDistanceInKm(
      sellerLatitude,
      sellerLongitude,
      buyerLatitude,
      buyerLongitude,
    );

    if (distanceKm > product.seller.delivery_radius_km) {
      throw new BadRequestError('Buyer location is outside the seller delivery radius');
    }
  }

  private static calculateDistanceInKm(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
  ) {
    const earthRadiusKm = 6371;
    const dLat = this.toRadians(toLatitude - fromLatitude);
    const dLon = this.toRadians(toLongitude - fromLongitude);
    const lat1 = this.toRadians(fromLatitude);
    const lat2 = this.toRadians(toLatitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  private static toRadians(value: number) {
    return value * (Math.PI / 180);
  }

  static async fetchOrderDetailsById(orderId:string){
    const orderData=await orderRepository.fetchOrderById(orderId);

    if(!orderId) throw new BadRequestError('Order Details not found');
    
    const orderItems=await orderRepository.fetchOrderItems(orderId);

    if(!orderItems) throw new BadRequestError('Failed to fetch Order Items');

    return {
      order:orderData,
      OrderItems:orderItems,
    };
  }

  static async fetchOrdersForUser(userId:string){
    const orders=await orderRepository.fetchOrderForUser(userId);

    if(!orders) throw new BadRequestError('No order for the user');

    return orders;
  }

  static async fetchOrdersForSeller(userId:string){
    const orders=await orderRepository.fetchOrderForSeller(userId);

    if(!orders) throw new BadRequestError('No order for the user');

    return orders;
  }
}
