import { env } from "@/shared/config/env";

const url = new URL(env.REDIS_URL);

export const bullmqConnection = {
	host: url.hostname,
	port: Number(url.port) || 6379,
	password: url.password || undefined,
};
