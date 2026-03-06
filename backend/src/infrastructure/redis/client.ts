import Redis from "ioredis";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";

export const redis = new Redis(env.REDIS_URL, {
	maxRetriesPerRequest: 3,
	lazyConnect: true,
});

redis.on("error", (err) => logger.error(err, "Redis connection error"));
redis.on("connect", () => logger.info("Connected to Redis"));

export async function connectRedis(): Promise<void> {
	await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
	await redis.quit();
}
