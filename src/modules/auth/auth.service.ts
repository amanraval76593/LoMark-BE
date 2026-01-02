import config from "../../config";
import { UserRow } from "../../database";
import { BadRequestError, UnauthorizedError } from "../../errors/app.error";
import { AuthResponse, LoginDTO, RegisterDTO } from "./auth.interface";
import { AuthRepository } from "./auth.repository";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export class AuthService {

    static async registerUser(data: RegisterDTO): Promise<AuthResponse> {

        const existingUser = await AuthRepository.findByEmail(data.email);

        if (existingUser) throw new BadRequestError("User Already Exist");

        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await AuthRepository.createUser({
            name: data.name,
            email: data.email,
            role: data.role,
            passwordHash: passwordHash
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.JWT_SECRET!,
            { expiresIn: "1d" }
        )

        const { password_hash, ...safeUser } = user;

        return { token: token, user: safeUser }

    }

    static async login(data: LoginDTO): Promise<AuthResponse> {

        const user = await AuthRepository.findByEmail(data.email);

        if (!user) throw new UnauthorizedError("Invalid Credentials");

        const isMatch = await bcrypt.compare(data.password, user.password_hash);

        if (!isMatch) throw new UnauthorizedError("Invalid credentials");

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: "1d" }
        )

        const { password_hash, ...safeUser } = user;

        return { token: token, user: safeUser }
    }

}