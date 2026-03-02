import { Client } from "cassandra-driver";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";
import { runScyllaMigrations } from "./migrator";

const contactPoints = env.SCYLLA_CONTACT_POINTS.split(",").map((p) =>
	p.trim(),
);

export const scyllaClient = new Client({
	contactPoints,
	localDataCenter: env.SCYLLA_DATACENTER,
	keyspace: env.SCYLLA_KEYSPACE,
	queryOptions: {
		prepare: true,
	},
});

async function ensureKeyspace(): Promise<void> {
	const initClient = new Client({
		contactPoints,
		localDataCenter: env.SCYLLA_DATACENTER,
	});

	try {
		await initClient.connect();

		const replication =
			env.NODE_ENV === "production"
				? `{'class': 'NetworkTopologyStrategy', '${env.SCYLLA_DATACENTER}': ${env.SCYLLA_REPLICATION_FACTOR}}`
				: `{'class': 'SimpleStrategy', 'replication_factor': ${env.SCYLLA_REPLICATION_FACTOR}}`;

		await initClient.execute(
			`CREATE KEYSPACE IF NOT EXISTS ${env.SCYLLA_KEYSPACE} WITH replication = ${replication}`,
		);

		logger.debug({ keyspace: env.SCYLLA_KEYSPACE }, "Keyspace ensured");
	} finally {
		await initClient.shutdown();
	}
}

export async function connectScylla(): Promise<void> {
	try {
		await ensureKeyspace();
		await scyllaClient.connect();
		logger.info("Connected to ScyllaDB");
		await runScyllaMigrations(scyllaClient);
	} catch (err) {
		logger.error(err, "Failed to connect to ScyllaDB");
		throw err;
	}
}

export async function disconnectScylla(): Promise<void> {
	try {
		await scyllaClient.shutdown();
		logger.info("ScyllaDB disconnected");
	} catch (err) {
		logger.error(err, "Error shutting down ScyllaDB");
	}
}
