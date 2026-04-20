import { UUID } from "crypto";
import { BadRequestError } from "../../errors/app.error";
import { SellerLocationData, SellerProfileData } from "./seller.interface";
import { SellerRepository } from "./seller.repository";


export class SellerService
 {
    static async CreateSellerService(user: any, long: number, lat: number, deliveryRadius: number, businessType: string) {

        if (lat < -90 || lat > 90) throw new BadRequestError("Invalid Latitude");

        if (long < -180 || long > 180) throw new BadRequestError("Invalid Longitude");

        if (deliveryRadius <= 0) throw new BadRequestError("Delivery radius must be greater than 0");

        const sellerId = user?.id;

        if (!sellerId) throw new BadRequestError("User Id not found ");

        const sellerProfileData: SellerProfileData = {
            sellerId: sellerId as SellerProfileData["sellerId"],
            location: {
                latitude: lat,
                longitude: long
            },
            deliveryRadius,
            businessType
        };

        const response = await SellerRepository.CreateSellerProfile(sellerProfileData);

        return response;
    }

    static async fetchSellerLocationService(user:any) {

        const sellerId = user?.id;

        if (!sellerId) throw new BadRequestError("User Id not found");

        const response = await SellerRepository.fetchSellerProfile(sellerId);

        return response;
    }

    static async ChangeSellerLocationService(userId:string,lat:number,long:number){

        const sellerLocationData:SellerLocationData={
            sellerId:userId as UUID,
            location:{
                latitude:lat,
                longitude:long
            }
        }

        const response=await SellerRepository.ChangeSellerLocation(sellerLocationData)

        return response
         
    }
}
