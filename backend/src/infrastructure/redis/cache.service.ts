import type Redis from "ioredis";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export class CacheService {
	constructor(private readonly redis: Redis) {}

	async get<T>(key: string): Promise<T | null> {
		const raw = await this.redis.get(key);
		if (raw === null) return null;
		return JSON.parse(raw, (_k, v) => {
			if (typeof v === "string" && ISO_DATE_RE.test(v)) return new Date(v);
			return v;
		}) as T;
	}

	async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
		await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
	}

	async del(...keys: string[]): Promise<void> {
		if (keys.length > 0) await this.redis.del(...keys);
	}

	async delPattern(pattern: string): Promise<void> {
		const keys = await this.redis.keys(pattern);
		if (keys.length > 0) await this.redis.del(...keys);
	}
}
