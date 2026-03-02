import { readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { Client } from "cassandra-driver";
import { logger } from "@/shared/logger";

const MIGRATIONS_DIR = resolve("src/migrations/scylla");

export async function runScyllaMigrations(client: Client): Promise<void> {
	const files = (await readdir(MIGRATIONS_DIR))
		.filter((f) => f.endsWith(".cql"))
		.sort();

	for (const file of files) {
		const path = join(MIGRATIONS_DIR, file);
		const content = await Bun.file(path).text();

		const statements = content
			.split(";")
			.map((s) => s.trim())
			.filter(Boolean);

		for (const stmt of statements) {
			await client.execute(stmt);
		}

		logger.debug({ migration: file }, "ScyllaDB migration applied");
	}

	logger.info(`ScyllaDB: ${files.length} migration(s) applied`);
}
