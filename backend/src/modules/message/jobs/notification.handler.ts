import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import type { IJobHandler } from "@/infrastructure/bullmq/types";
import type { IWsManager } from "@/transport/ws.types";
import { logger } from "@/shared/logger";
import type { NotificationJobData } from "./notification.types";

export class NotificationJobHandler implements IJobHandler<NotificationJobData> {
	constructor(
		private readonly chatRepo: IChatRepository,
		private readonly userRepo: IUserRepository,
		private readonly wsManager: IWsManager,
	) {}

	async handle(data: NotificationJobData): Promise<void> {
		const { chatId, messageId, senderId, content } = data;

		const members = await this.chatRepo.getMembers(chatId);

		const sender = await this.userRepo.findById(senderId);
		const senderName = sender?.displayName ?? "Unknown";

		const offlineUserIds: string[] = [];

		for (const member of members) {
			if (member.userId === senderId) continue;

			const isOnline = this.wsManager.isUserOnline(member.userId);
			if (!isOnline) {
				offlineUserIds.push(member.userId);
			}
		}

		if (offlineUserIds.length > 0) {
			logger.info(
				{
					chatId,
					messageId,
					senderName,
					offlineCount: offlineUserIds.length,
					offlineUserIds,
				},
				"Notification: offline users to notify",
			);
		}

		const onlineNonSenderCount =
			members.length - 1 - offlineUserIds.length;
		if (onlineNonSenderCount > 0) {
			for (const member of members) {
				if (member.userId === senderId) continue;
				if (offlineUserIds.includes(member.userId)) continue;

				this.wsManager.broadcastToUser(member.userId, {
					event: "notification:new",
					data: {
						chatId,
						messageId,
						senderName,
						content:
							content.length > 100
								? `${content.slice(0, 100)}...`
								: content,
					},
				});
			}
		}

		logger.debug(
			{
				chatId,
				messageId,
				totalMembers: members.length,
				offlineCount: offlineUserIds.length,
			},
			"Notification job completed",
		);
	}
}
