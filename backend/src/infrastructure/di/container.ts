import { createContainer, asClass, asValue, asFunction, InjectionMode } from "awilix";

import { redis } from "@/infrastructure/redis/client";
import { CacheService } from "@/infrastructure/redis/cache.service";
import { BullMQJobQueue } from "@/infrastructure/bullmq/bullmq-job-queue";
import { WsConnectionManager } from "@/transport/ws.connection-manager";
import { WsRouter } from "@/transport/ws.router";

import { PgUserRepository } from "@/repositories/postgres/pg-user.repository";
import { PgChatRepository } from "@/repositories/postgres/pg-chat.repository";
import { ScyllaMessageRepository } from "@/repositories/scylla/scylla-message.repository";
import { S3FileStorage } from "@/repositories/s3/s3-file-storage";
import { CachedUserRepository } from "@/repositories/cached/cached-user.repository";
import { CachedChatRepository } from "@/repositories/cached/cached-chat.repository";

import { RegisterUseCase } from "@/modules/auth/use-cases/register";
import { LoginUseCase } from "@/modules/auth/use-cases/login";
import { CreateChatUseCase } from "@/modules/chat/use-cases/create-chat";
import { GetUserChatsUseCase } from "@/modules/chat/use-cases/get-user-chats";
import { AddMemberUseCase } from "@/modules/chat/use-cases/add-member";
import { SendMessageUseCase } from "@/modules/message/use-cases/send-message";
import { GetHistoryUseCase } from "@/modules/message/use-cases/get-history";
import { DeleteMessageUseCase } from "@/modules/message/use-cases/delete-message";
import { MarkAsReadUseCase } from "@/modules/message/use-cases/mark-as-read";
import { GetProfileUseCase } from "@/modules/user/use-cases/get-profile";
import { UpdateProfileUseCase } from "@/modules/user/use-cases/update-profile";
import { UploadFileUseCase } from "@/modules/upload/use-cases/upload-file";

import { NotificationJobHandler } from "@/modules/message/jobs/notification.handler";
import { MediaProcessingJobHandler } from "@/modules/upload/jobs/media-processing.handler";

import type { NotificationJobData } from "@/modules/message/jobs/notification.types";
import type { MediaProcessingJobData } from "@/modules/upload/jobs/media-processing.types";

export function createAppContainer() {
	const container = createContainer({
		injectionMode: InjectionMode.CLASSIC,
	});

	container.register({
		// ─── Infrastructure ───────────────────────────────
		redis: asValue(redis),
		cacheService: asClass(CacheService).singleton(),

		// ─── WebSocket ────────────────────────────────────
		wsManager: asClass(WsConnectionManager).singleton(),
		wsRouter: asClass(WsRouter).singleton(),

		// ─── Job queues ───────────────────────────────────
		notificationQueue: asFunction(() =>
			new BullMQJobQueue<NotificationJobData>("notification", {
				attempts: 3,
				backoff: { type: "exponential", delay: 1000 },
			}),
		).singleton(),

		mediaProcessingQueue: asFunction(() =>
			new BullMQJobQueue<MediaProcessingJobData>("media-processing", {
				attempts: 2,
				backoff: { type: "exponential", delay: 2000 },
				removeOnComplete: 50,
				removeOnFail: 200,
			}),
		).singleton(),

		// ─── Job handlers ─────────────────────────────────
		notificationJobHandler: asClass(NotificationJobHandler).singleton(),
		mediaProcessingJobHandler: asClass(MediaProcessingJobHandler).singleton(),

		// ─── Raw repositories ─────────────────────────────
		pgUserRepo: asClass(PgUserRepository).singleton(),
		pgChatRepo: asClass(PgChatRepository).singleton(),
		messageRepo: asClass(ScyllaMessageRepository).singleton(),
		fileStorage: asClass(S3FileStorage).singleton(),

		// ─── Cached repositories ──────────────────────────
		userRepo: asClass(CachedUserRepository).singleton(),
		chatRepo: asClass(CachedChatRepository).singleton(),

		// ─── Auth use-cases ───────────────────────────────
		registerUC: asClass(RegisterUseCase).singleton(),
		loginUC: asClass(LoginUseCase).singleton(),

		// ─── Chat use-cases ───────────────────────────────
		createChatUC: asClass(CreateChatUseCase).singleton(),
		getUserChatsUC: asClass(GetUserChatsUseCase).singleton(),
		addMemberUC: asClass(AddMemberUseCase).singleton(),

		// ─── Message use-cases ────────────────────────────
		sendMessageUC: asClass(SendMessageUseCase).singleton(),
		getHistoryUC: asClass(GetHistoryUseCase).singleton(),
		deleteMessageUC: asClass(DeleteMessageUseCase).singleton(),
		markAsReadUC: asClass(MarkAsReadUseCase).singleton(),

		// ─── User use-cases ───────────────────────────────
		getProfileUC: asClass(GetProfileUseCase).singleton(),
		updateProfileUC: asClass(UpdateProfileUseCase).singleton(),

		// ─── Upload use-cases ─────────────────────────────
		uploadFileUC: asClass(UploadFileUseCase).singleton(),
	});

	return container;
}

export type AppContainer = ReturnType<typeof createAppContainer>;
