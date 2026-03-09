import type { EventBus } from "@/infrastructure/event-bus/event-bus";
import type { IWsRouter } from "@/transport/ws.types";
import { logger } from "@/shared/logger";
import type { SendMessageUseCase } from "./use-cases/send-message";

export function registerMessageWsHandlers(
	sendMessageUC: SendMessageUseCase,
	wsRouter: IWsRouter,
	eventBus: EventBus,
) {
	wsRouter.register("message:new", async (ws, data) => {
		try {
			const { chatId, content, mediaKeys, replyTo } = data as {
				chatId: string;
				content: string;
				mediaKeys?: string[];
				replyTo?: string;
			};
			const userId = ws.data.userId;
			if (!userId) return;

			const message = await sendMessageUC.execute(userId, {
				chatId,
				content,
				mediaKeys,
				replyTo,
			});

			eventBus.emit("broadcast:chat", {
				chatId,
				excludeUserId: userId,
				message: {
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
						replyTo: message.replyTo,
						createdAt: message.createdAt.toISOString(),
					},
				},
			});
		} catch (err) {
			logger.error(err, "WS message:new handler error");
		}
	});
}
