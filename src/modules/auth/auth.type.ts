export enum UserRole {
    USER = "USER",
    FARMER = "FARMER",
    DELIVERY_PARTNER = "DELIVERY_PARTNER",
}

export interface JwtPayload {
    userId: string;
    role: UserRole;
}