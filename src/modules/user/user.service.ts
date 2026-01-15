import { BadRequestError } from "../../errors/app.error";
import { UserRepository } from "./user.repository";

export class UserService {

    static async assignLocationToSeller(user: any, long: number, lat: number) {

        if (lat < -90 || lat > 90) throw new BadRequestError("Invalid Latitude");

        if (long < -180 || long > 180) throw new BadRequestError("Invalid Longitude");

        const sellerId = user?.id;

        if (!sellerId) throw new BadRequestError("User Id not found ");

        const response = await UserRepository.assignSellerLocation(sellerId, long, lat);

        return { response };
    }

    static async fetchSellerLocation(user: any) {

        const sellerId = user?.id;

        if (!sellerId) throw new BadRequestError("User Id not found");

        const response = await UserRepository.fetchSellerLocation(sellerId);

        return { response };
    }
}

