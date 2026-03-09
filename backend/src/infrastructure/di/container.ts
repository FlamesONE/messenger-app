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

import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import type { IWsManager, IWsRouter } from "@/transport/ws.types";
import type { IJobQueue } from "@/infrastructure/bullmq/types";
import { EventBus } from "@/infrastructure/event-bus/event-bus";
import type { NotificationJobData } from "@/modules/message/jobs/notification.types";
import type { MediaProcessingJobData } from "@/modules/upload/jobs/media-processing.types";

export interface AppContext {
	// repositories
	userRepo: IUserRepository;
	chatRepo: IChatRepository;
	messageRepo: IMessageRepository;
	fileStorage: IFileStorage;

	// transport
	wsManager: IWsManager;
	wsRouter: IWsRouter;

	// events
	eventBus: EventBus;

	// job queues
	notificationQueue: IJobQueue<NotificationJobData>;
	mediaProcessingQueue: IJobQueue<MediaProcessingJobData>;
}

export function createAppContext(): AppContext {
	const cacheService = new CacheService(redis);

	// raw repositories
	const pgUserRepo = new PgUserRepository();
	const pgChatRepo = new PgChatRepository();
	const messageRepo = new ScyllaMessageRepository();
	const fileStorage = new S3FileStorage();

	// cached repositories
	const userRepo = new CachedUserRepository(pgUserRepo, cacheService);
	const chatRepo = new CachedChatRepository(pgChatRepo, cacheService);

	// transport
	const wsManager = new WsConnectionManager();
	const wsRouter = new WsRouter();
	const eventBus = new EventBus();

	// job queues
	const notificationQueue = new BullMQJobQueue<NotificationJobData>("notification", {
		attempts: 3,
		backoff: { type: "exponential", delay: 1000 },
	});

	const mediaProcessingQueue = new BullMQJobQueue<MediaProcessingJobData>("media-processing", {
		attempts: 2,
		backoff: { type: "exponential", delay: 2000 },
		removeOnComplete: 50,
		removeOnFail: 200,
	});

	return {
		userRepo,
		chatRepo,
		messageRepo,
		fileStorage,
		wsManager,
		wsRouter,
		eventBus,
		notificationQueue,
		mediaProcessingQueue,
	};
}
