import { z } from "zod";

export const registerDto = z.object({
	email: z.email(),
	username: z.string().min(3).max(64),
	displayName: z.string().min(1).max(128),
	password: z.string().min(8).max(128),
});

export type RegisterDto = z.infer<typeof registerDto>;
