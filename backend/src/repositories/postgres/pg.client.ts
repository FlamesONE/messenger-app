import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";

const pool = new pg.Pool({
	connectionString: env.DATABASE_URL,
});

pool.on("error", (err) => {
	logger.error(err, "Unexpected PostgreSQL pool error");
});

export const db = drizzle(pool);
export { pool };
