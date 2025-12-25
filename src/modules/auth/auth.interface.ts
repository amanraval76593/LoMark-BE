import { UserRow } from "../../database";
import { UserRole } from "./auth.type";

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface UserEntity {
    name: string;
    email: string;
    role: UserRole;
    passwordHash: string;
}

export interface AuthResponse {
    user: Omit<UserRow, "password_hash">;
    token: string
}