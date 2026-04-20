import { postgresPool } from "../../database";
import { SellerLocationData, SellerProfile, SellerProfileData } from "./seller.interface";


export class SellerRepository {

    static async CreateSellerProfile(data: SellerProfileData): Promise<SellerProfile> {

        const result = await postgresPool.query<SellerProfile>(
            `
                INSERT INTO seller_profiles(
                    user_id,
                    location,
                    delivery_radius_km,
                    business_type
                )
                VALUES (
                    $1,
                    ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
                    $4,
                    $5
                )
                ON CONFLICT (user_id) DO UPDATE
                SET
                    location = EXCLUDED.location,
                    delivery_radius_km = EXCLUDED.delivery_radius_km,
                    business_type = EXCLUDED.business_type
                RETURNING
                    id,
                    user_id,
                    ST_Y(location::geometry) AS latitude,
                    ST_X(location::geometry) AS longitude,
                    delivery_radius_km,
                    business_type,
                    rating_avg,
                    total_ratings,
                    is_active,
                    created_at,
                    updated_at
            `,
            [
                data.sellerId,
                data.location.longitude,
                data.location.latitude,
                data.deliveryRadius,
                data.businessType
            ]
        );

        return result.rows[0];
    }

    static async fetchSellerProfile(sellerId: string) {

        const result = await postgresPool.query<SellerProfile>(
            `
                SELECT
                    id,
                    user_id,
                    ST_Y(location::geometry) AS latitude,
                    ST_X(location::geometry) AS longitude,
                    delivery_radius_km,
                    business_type,
                    rating_avg,
                    total_ratings,
                    is_active,
                    created_at,
                    updated_at
                FROM seller_profiles
                WHERE user_id = $1
            `,
            [sellerId]
        );

        return result.rows[0];
    }

    static async ChangeSellerLocation(data:SellerLocationData){

        const result=await postgresPool.query<SellerProfile>(
            `
            UPDATE seller_profiles
            SET location=ST_MakePoint($1,$2)::geography
            WHERE user_id=$3
            RETURNING *
            `,
            [data.location.longitude,data.location.latitude,data.sellerId]
        );

        return result.rows[0];

    }

}
