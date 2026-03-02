import { Client } from "cassandra-driver";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";

const contactPoints = env.SCYLLA_CONTACT_POINTS.split(",").map((p) => p.trim());

export const scyllaClient = new Client({
	contactPoints,
	localDataCenter: env.SCYLLA_DATACENTER,
	keyspace: env.SCYLLA_KEYSPACE,
});

export async function connectScylla(): Promise<void> {
	try {
		await scyllaClient.connect();
		logger.info("Connected to ScyllaDB");
	} catch (err) {
		logger.error(err, "Failed to connect to ScyllaDB");
		throw err;
	}
}
