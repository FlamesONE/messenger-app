import { drizzle } from "drizzle-orm/node-postgres";
import type { Logger } from "drizzle-orm/logger";
import pg from "pg";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";
import * as schema from "./schema";

class PinoLogger implements Logger {
	logQuery(query: string, params: unknown[]): void {
		logger.debug({ query, params }, "SQL");
	}
}

const pool = new pg.Pool({
	connectionString: env.DATABASE_URL,
	max: env.NODE_ENV === "production" ? 20 : 5,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
	logger.error(err, "Unexpected PostgreSQL pool error");
});

export const db = drizzle(pool, {
	schema,
	logger: env.NODE_ENV !== "production" ? new PinoLogger() : false,
});

export { pool };
