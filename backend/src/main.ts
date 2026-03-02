import { createAuthModule } from "@/modules/auth/auth.module";
import { createChatModule } from "@/modules/chat/chat.module";
import { createMessageModule } from "@/modules/message/message.module";
import { createUploadModule } from "@/modules/upload/upload.module";
import { createUserModule } from "@/modules/user/user.module";
import { PgChatRepository } from "@/repositories/postgres/pg-chat.repository";
import { pool } from "@/infrastructure/pg/client";
import { PgUserRepository } from "@/repositories/postgres/pg-user.repository";
import { S3FileStorage } from "@/repositories/s3/s3-file-storage";
import {
	connectScylla,
	disconnectScylla,
} from "@/infrastructure/scylla/client";
import { ScyllaMessageRepository } from "@/repositories/scylla/scylla-message.repository";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";
import { createHttpServer } from "@/transport/http.server";
import { createWsGateway } from "@/transport/ws.gateway";

const userRepo = new PgUserRepository();
const chatRepo = new PgChatRepository();
const messageRepo = new ScyllaMessageRepository();
const fileStorage = new S3FileStorage();

const authModule = createAuthModule(userRepo);
const messageModule = createMessageModule(messageRepo, chatRepo, fileStorage);
const chatModule = createChatModule(chatRepo);
const userModule = createUserModule(userRepo);
const uploadModule = createUploadModule(fileStorage);

const app = createHttpServer()
	.use(createWsGateway())
	.use(authModule.http)
	.use(messageModule.http)
	.use(chatModule.http)
	.use(userModule.http)
	.use(uploadModule.http);

export type App = typeof app;

async function bootstrap() {
	await connectScylla();

	app.listen(env.PORT);

	logger.info(`Server running at ${app.server?.hostname}:${app.server?.port}`);
}

async function shutdown() {
	logger.info("Shutting down...");
	app.stop();
	await disconnectScylla();
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
