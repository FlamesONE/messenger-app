import type Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import type { Options } from "elysia-rate-limit";

type Server = Elysia["server"];
let server: Server = null;

export function setRateLimitServer(s: Server) {
	server = s;
}

const shared: Partial<Options> = {
	scoping: "scoped",
	injectServer: () => server!,
};

export const authRateLimit = rateLimit({
	...shared,
	max: 10,
	duration: 60_000,
	errorResponse: "Too many auth attempts, please try again later",
});

export const uploadRateLimit = rateLimit({
	...shared,
	max: 20,
	duration: 60_000,
	errorResponse: "Too many uploads, please try again later",
});
