import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/repositories/postgres/schema.ts",
	out: "./src/repositories/postgres/migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
