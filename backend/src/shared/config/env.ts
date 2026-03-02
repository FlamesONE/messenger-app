import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),

	DATABASE_URL: z.string().min(1),

	SCYLLA_CONTACT_POINTS: z.string().default("localhost:9042"),
	SCYLLA_DATACENTER: z.string().default("datacenter1"),
	SCYLLA_KEYSPACE: z.string().default("messenger"),

	REDIS_URL: z.string().default("redis://localhost:6379"),

	JWT_SECRET: z.string().min(32),
	JWT_EXPIRES_IN: z.string().default("7d"),

	S3_ENDPOINT: z.string().optional(),
	S3_REGION: z.string().default("us-east-1"),
	S3_BUCKET: z.string().default("messenger-uploads"),
	S3_ACCESS_KEY: z.string().optional(),
	S3_SECRET_KEY: z.string().optional(),

	CORS_ORIGIN: z.string().default("http://localhost:5173"),

	MEILISEARCH_URL: z.string().default("http://localhost:7700"),
	MEILISEARCH_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error("Invalid environment variables:", parsed.error.format());
		process.exit(1);
	}

	return parsed.data;
}

export const env = loadEnv();
