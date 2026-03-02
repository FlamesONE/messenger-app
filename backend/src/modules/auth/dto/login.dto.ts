import { t } from "elysia";
import { db } from "@/infrastructure/pg/model";

const { email } = db.insert.user;

export const loginDto = t.Object({
	email,
	password: t.String({ minLength: 1 }),
});

export type LoginDto = typeof loginDto.static;
