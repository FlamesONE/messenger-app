import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { env } from "@/shared/config/env";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
	jwt({
		name: "jwt",
		secret: env.JWT_SECRET,
	}),
);

export const authGuard = new Elysia({ name: "auth-guard" })
	.use(jwtPlugin)
	.macro({
		auth: {
			async resolve({ jwt, headers, status }) {
				const raw = headers.authorization;
				if (!raw?.startsWith("Bearer ")) {
					return status(401, {
						error: "UNAUTHORIZED",
						message: "Missing token",
					});
				}

				const payload = await jwt.verify(raw.slice(7));
				if (!payload || !payload.sub) {
					return status(401, {
						error: "UNAUTHORIZED",
						message: "Invalid token",
					});
				}

				return { userId: payload.sub as string };
			},
		},
	});
