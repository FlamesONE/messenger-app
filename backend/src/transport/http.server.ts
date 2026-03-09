import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { env } from "@/shared/config/env";
import { mapErrorToResponse } from "./error-mapper";

export function createHttpServer() {
	const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
	const isDev = env.NODE_ENV === "development";

	return new Elysia({ name: "http-server" })
		.use(
			cors({
				origin: isDev ? true : origins,
				methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
				credentials: true,
				maxAge: 86400,
			}),
		)
		.use(openapi())
		.get("/health", () => ({ status: "ok" }))
		.onBeforeHandle(({ set }) => {
			set.headers["X-Content-Type-Options"] = "nosniff";
			set.headers["X-Frame-Options"] = "DENY";
			set.headers["X-XSS-Protection"] = "0";
			set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
			set.headers["Permissions-Policy"] =
				"camera=(), microphone=(), geolocation=()";
		})
		.onError(({ error, code }) => mapErrorToResponse(error as Error, code));
}
