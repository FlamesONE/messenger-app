import {
	registerWorker,
	startWorkers,
	stopWorkers,
} from "@/infrastructure/bullmq/worker-registry";
import { createAppContainer } from "@/infrastructure/di/container";
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
import type { IJobHandler, IJobQueue } from "@/infrastructure/bullmq/types";
import type { IWsManager, IWsRouter } from "@/transport/ws.types";
import { logger } from "@/shared/logger";
import type { NotificationJobData } from "@/modules/message/jobs/notification.types";
import type { MediaProcessingJobData } from "@/modules/upload/jobs/media-processing.types";
import { createHttpServer } from "@/transport/http.server";
import { createWsGateway } from "@/transport/ws.gateway";

const container = createAppContainer();

// ─── Resolve shared infrastructure ───────────────────────
const wsManager = container.resolve<IWsManager>("wsManager");
const wsRouter = container.resolve<IWsRouter>("wsRouter");

// ─── Register job handlers from modules ──────────────────
registerWorker(
	"notification",
	container.resolve<IJobHandler<NotificationJobData>>("notificationJobHandler"),
	5,
);
registerWorker(
	"media-processing",
	container.resolve<IJobHandler<MediaProcessingJobData>>("mediaProcessingJobHandler"),
	3,
);

// ─── Create modules ──────────────────────────────────────
const authModule = createAuthModule(
	container.resolve("registerUC"),
	container.resolve("loginUC"),
);

const chatModule = createChatModule(
	container.resolve("chatRepo"),
	container.resolve("createChatUC"),
	container.resolve("getUserChatsUC"),
	container.resolve("addMemberUC"),
	wsManager,
	wsRouter,
);

const messageModule = createMessageModule(
	container.resolve("sendMessageUC"),
	container.resolve("getHistoryUC"),
	container.resolve("deleteMessageUC"),
	container.resolve("markAsReadUC"),
	container.resolve("notificationQueue"),
	wsManager,
	wsRouter,
);

const userModule = createUserModule(
	container.resolve("getProfileUC"),
	container.resolve("updateProfileUC"),
);

const uploadModule = createUploadModule(
	container.resolve("uploadFileUC"),
	container.resolve("mediaProcessingQueue"),
);

const app = createHttpServer()
	.use(createWsGateway(wsManager, wsRouter))
	.use(authModule.http)
	.use(messageModule.http)
	.use(chatModule.http)
	.use(userModule.http)
	.use(uploadModule.http);

export type App = typeof app;

async function bootstrap() {
	await connectRedis();
	await connectScylla();
	startWorkers();

	app.listen(env.PORT);

	logger.info(`Server running at ${app.server?.hostname}:${app.server?.port}`);
}

async function shutdown() {
	logger.info("Shutting down...");
	app.stop();
	await stopWorkers();

	const notificationQueue: IJobQueue<unknown> = container.resolve("notificationQueue");
	const mediaProcessingQueue: IJobQueue<unknown> = container.resolve("mediaProcessingQueue");
	await notificationQueue.close();
	await mediaProcessingQueue.close();

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
