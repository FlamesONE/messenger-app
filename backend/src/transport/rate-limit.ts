import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";

export const globalRateLimit = new Elysia({ name: "global-rate-limit" }).use(
	rateLimit({
		max: 100,
		duration: 60_000,
	}),
);

export const authRateLimit = new Elysia({ name: "auth-rate-limit" }).use(
	rateLimit({
		max: 10,
		duration: 60_000,
		errorResponse: "Too many auth attempts, please try again later",
	}),
);

export const uploadRateLimit = new Elysia({ name: "upload-rate-limit" }).use(
	rateLimit({
		max: 20,
		duration: 60_000,
		errorResponse: "Too many uploads, please try again later",
	}),
);
