import type { IJobQueue } from "@/infrastructure/bullmq/types";
import type { IWsManager, IWsRouter } from "@/transport/ws.types";
import { logger } from "@/shared/logger";
import type { NotificationJobData } from "./jobs/notification.types";
import type { SendMessageUseCase } from "./use-cases/send-message";

export function registerMessageWsHandlers(
	sendMessageUC: SendMessageUseCase,
	notificationQueue: IJobQueue<NotificationJobData>,
	wsManager: IWsManager,
	wsRouter: IWsRouter,
) {
	wsRouter.register("message:new", async (ws, data) => {
		try {
			const { chatId, content, mediaKeys } = data as {
				chatId: string;
				content: string;
				mediaKeys?: string[];
			};
			const userId = ws.data.userId;
			if (!userId) return;

			const message = await sendMessageUC.execute(userId, {
				chatId,
				content,
				mediaKeys,
			});

			wsManager.broadcastToChat(chatId, {
				event: "message:new",
				data: {
					chatId: message.chatId,
					messageId: message.id,
					senderId: message.senderId,
					content: message.content,
					media: message.media.map((m) => ({
						url: m.url,
						type: m.type,
						name: m.name,
					})),
					createdAt: message.createdAt.toISOString(),
				},
			});

			await notificationQueue.add("new-message", {
				chatId: message.chatId,
				messageId: message.id,
				senderId: message.senderId,
				content: message.content,
			});
		} catch (err) {
			logger.error(err, "WS message:new handler error");
		}
	});
}
