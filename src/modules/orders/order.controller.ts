import type { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { NotFoundError, UnauthorizedError } from '../../errors/app.error';

export class OrderController {

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) throw new NotFoundError('User Not found');

      const { sellerId, deliveryType, productList, buyerLocation } = req.body;
      const response = await OrderService.createOrder({
        userId: user.id,
        deliveryType: deliveryType,
        productList: productList,
        sellerId: sellerId,
        buyerLocation,
      });

      res.status(200).json({
        message: 'Order created successfully',
        data: response,
      });

    } catch (error) {
      next(error);
    }
  }

  static async fetchOrderDetailsById(req:Request,res:Response,next:NextFunction){

    try{
      const { orderId }=req.params;

      const respone=await OrderService.fetchOrderDetailsById(orderId);

      res.status(200).json({
        data:respone,
      });
    }catch(error){
      next(error);
    }
  }

  static async fetchOrderForUser(req:Request,res:Response,next:NextFunction){
    try{
      const userId=req.user?.id;

      if(!userId) throw new UnauthorizedError('User Id not found');


      const response=await OrderService.fetchOrdersForUser(userId);

      return res.status(200).json({
        data:response,
      });
    }catch(error){
      next(error);
    }
  }

  static async fetchOrderForSeller(req:Request,res:Response,next:NextFunction){
    try{
      const userId=req.user?.id;

      if(!userId) throw new UnauthorizedError('User Id not found');


      const response=await OrderService.fetchOrdersForSeller(userId);

      return res.status(200).json({
        data:response,
      });
    }catch(error){
      next(error);
    }
  }

}
