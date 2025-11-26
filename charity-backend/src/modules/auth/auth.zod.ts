import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const ChangeEmailSchema = z.object({
  newEmail: z.string().email(),
  password: z.string().min(1),
});

export type ChangeEmailDto = z.infer<typeof ChangeEmailSchema>;
