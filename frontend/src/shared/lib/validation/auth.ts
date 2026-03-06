import { z } from "zod/v4";

export const loginSchema = z.object({
	email: z.email("Введите корректный email"),
	password: z.string().min(1, "Введите пароль"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
	.object({
		email: z.email("Введите корректный email"),
		username: z
			.string()
			.min(3, "Минимум 3 символа")
			.max(64, "Максимум 64 символа")
			.regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
		displayName: z.string().max(128, "Максимум 128 символов").optional().default(""),
		password: z.string().min(8, "Минимум 8 символов"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});

export type RegisterFormData = z.infer<typeof registerSchema>;
