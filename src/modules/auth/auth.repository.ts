import { postgresPool } from "../../database";
import { UserRole, UserRow } from "../../database";
import { UserEntity } from "./auth.interface";


export class AuthRepository {
    static async findByEmail(email: string): Promise<UserRow | null> {
        const result = await postgresPool.query<UserRow>(
            `
            SELECT *  
            FROM users 
            WHERE email=$1
            LIMIT 1
            `,
            [email]
        );
        return result.rows[0] ?? null;
    }

    static async createUser(user: UserEntity): Promise<UserRow> {
        const result = await postgresPool.query<UserRow>(
            `
            INSERT INTO users(
            name,
            email,
            password_hash,
            role
            )
            VALUES($1,$2,$3,$4)
            RETURNING *
            `,
            [user.name, user.email, user.passwordHash, user.role]
        );
        return result.rows[0];
    }

    static async findUserById(userId: string): Promise<UserRow | null> {
        const result = await postgresPool.query<UserRow>(
            `
            SELECT *
            FROM users
            WHERE id=$1
            LIMIT 1
            `,
            [userId]
        );
        return result.rows[0] ?? null;
    }
}