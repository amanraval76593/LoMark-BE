import { z } from 'zod'
import { UserRole } from './auth.type'

export const RegisterSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.email(),
        password: z.string().min(6),
        role: z.enum(UserRole)
    })
});

export const LoginSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string()
    }),
});