import { Request, Response, NextFunction } from "express";
import { SellerService } from "./seller.service";
import { BadRequestError } from "../../errors/app.error";

export class SellerController {

    static async CreateSellerProfileController(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;

            const { location, deliveryRadius, businessType } = req.body;
            const response = await SellerService.CreateSellerService(
                user,
                location.longitude,
                location.latitude,
                deliveryRadius,
                businessType
            );

            res.status(201).json({ response });

        } catch (error) {
            next(error);
        }
    }

    static async fetchSellerProfileController(req: Request, res: Response, next: NextFunction) {
        try {

            const user = req.user;

            const response =await  SellerService.fetchSellerLocationService(user);

            res.status(200).json({ response });


        } catch (error) {
            next(error);
        }
    }

    static async ChangeSellerLocationController(req:Request,res:Response,next:NextFunction){
        try{

            const userId=req.user?.id

            const{latitude,longitude}=req.body

            if(!userId){
                throw new BadRequestError("User is invalid")
            }

            const response =await SellerService.ChangeSellerLocationService(userId,latitude,longitude)

            res.status(200).json({response})

        }catch(error){
            next(error)
        }
    }
}
