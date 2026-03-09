import {
	startWorkers,
	stopWorkers,
} from "@/infrastructure/bullmq/worker-registry";
import { createAppContext } from "@/infrastructure/di/container";
import { pool } from "@/infrastructure/pg/client";
import { connectRedis, disconnectRedis } from "@/infrastructure/redis/client";
import {
	connectScylla,
	disconnectScylla,
} from "@/infrastructure/scylla/client";
import { createAuthModule } from "@/modules/auth/auth.module";
import { createChatModule } from "@/modules/chat/chat.module";
import { createMessageModule } from "@/modules/message/message.module";
import { createUploadModule } from "@/modules/upload/upload.module";
import { createUserModule } from "@/modules/user/user.module";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";
import { createHttpServer } from "@/transport/http.server";
import { setRateLimitServer } from "@/transport/rate-limit";
import { createWsGateway } from "@/transport/ws.gateway";
import { registerBroadcastSubscribers } from "@/infrastructure/event-bus/broadcast.subscriber";

// ─── Create shared infrastructure context ─────────────────
const ctx = createAppContext();
registerBroadcastSubscribers(ctx);

// ─── Create modules ──────────────────────────────────────
const authModule = createAuthModule(ctx);
const chatModule = createChatModule(ctx);
const messageModule = createMessageModule(ctx);
const userModule = createUserModule(ctx);
const uploadModule = createUploadModule(ctx);

// ─── Assemble HTTP server ─────────────────────────────────
const app = createHttpServer()
	.use(createWsGateway(ctx.wsManager, ctx.wsRouter))
	.use(authModule.http)
	.use(messageModule.http)
	.use(chatModule.http)
	.use(userModule.http)
	.use(uploadModule.http)
	.use(uploadModule.filesProxy);

export type App = typeof app;

async function bootstrap() {
	await connectRedis();
	await connectScylla();
	startWorkers();

	app.listen(env.PORT);
	setRateLimitServer(app.server);

	logger.info(`Server running at ${app.server?.hostname}:${app.server?.port}`);
}

async function shutdown() {
	logger.info("Shutting down...");
	app.stop();
	await stopWorkers();

	await ctx.notificationQueue.close();
	await ctx.mediaProcessingQueue.close();

	await disconnectScylla();
	await disconnectRedis();
	await pool.end();
	logger.info("Graceful shutdown complete");
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

bootstrap().catch((err) => {
	logger.fatal(err, "Failed to start server");
	process.exit(1);
});
