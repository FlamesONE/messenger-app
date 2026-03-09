import { t } from "elysia";

export const loginDto = t.Object({
	email: t.String({ format: "email" }),
	password: t.String({ minLength: 1 }),
});

export type LoginDto = typeof loginDto.static;
