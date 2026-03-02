import { t } from "elysia";
import { db } from "@/infrastructure/pg/model";

const { email, username, displayName } = db.insert.user;

export const registerDto = t.Object({
	email,
	username: t.String({ minLength: 3, maxLength: 64 }),
	displayName: t.String({ minLength: 1, maxLength: 128 }),
	password: t.String({ minLength: 8, maxLength: 128 }),
});

export type RegisterDto = typeof registerDto.static;
