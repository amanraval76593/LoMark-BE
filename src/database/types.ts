export type UserRole =
    | "USER"
    | "FARMER"
    | "DELIVERY_PARTNER"
    | "ADMIN";

export interface UserRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    is_email_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}