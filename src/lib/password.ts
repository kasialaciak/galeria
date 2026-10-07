import { z } from "zod";

export const newPasswordSchema = z
  .string()
  .min(10, "Hasło musi mieć min. 10 znaków")
  .max(72, "Hasło może mieć maks. 72 znaki")
  .regex(/[A-Za-z]/, "Hasło musi zawierać literę")
  .regex(/\d/, "Hasło musi zawierać cyfrę");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Podaj obecne hasło"),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Hasła nie są takie same",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "Nowe hasło musi się różnić od obecnego",
  });
