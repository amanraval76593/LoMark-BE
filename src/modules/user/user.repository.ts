import { postgresPool, UserRow } from "../../database";


export class UserRepository {

    static async assignSellerLocation(sellerID: string, long: number, lat: number): Promise<UserRow> {

        const result = await postgresPool.query<UserRow>(
            `
                UPDATE users
                SET location =ST_MakePoint($1,$2)::geography
                WHERE id=$3
                RETURNING *;
            `,
            [long, lat, sellerID]
        );

        return result.rows[0];
    }

    static async fetchSellerLocation(sellerId: string) {

        const result = await postgresPool.query<UserRow>(
            `
            SELECT id,ST_AsText(location)
            FROM users
            WHERE id=$1
            `,
            [sellerId]
        );

        return result.rows[0];
    }

}