import { t } from "elysia";

export const registerDto = t.Object({
	email: t.String({ format: "email" }),
	username: t.String({ minLength: 3, maxLength: 64 }),
	displayName: t.String({ minLength: 1, maxLength: 128 }),
	password: t.String({ minLength: 8, maxLength: 128 }),
});

export type RegisterDto = typeof registerDto.static;
