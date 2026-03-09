import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import type { IJobHandler } from "@/infrastructure/bullmq/types";
import type { EventBus } from "@/infrastructure/event-bus/event-bus";
import { logger } from "@/shared/logger";
import type { NotificationJobData } from "./notification.types";

export class NotificationJobHandler implements IJobHandler<NotificationJobData> {
	constructor(
		private readonly userRepo: IUserRepository,
		private readonly eventBus: EventBus,
	) {}

	async handle(data: NotificationJobData): Promise<void> {
		const { chatId, messageId, senderId, content } = data;

		const sender = await this.userRepo.findById(senderId);
		const senderName = sender?.displayName ?? "Unknown";
		const senderAvatar = sender?.avatarUrl ?? null;

		this.eventBus.emit("broadcast:chat", {
			chatId,
			excludeUserId: senderId,
			message: {
				event: "notification:new",
				data: { chatId, messageId, senderName, senderAvatar, content },
			},
		});

		logger.debug(
			{ chatId, messageId, senderName },
			"Notification job completed",
		);
	}
}
