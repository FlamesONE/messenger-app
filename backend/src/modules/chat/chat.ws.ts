import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IWsManager, IWsRouter } from "@/transport/ws.types";
import { logger } from "@/shared/logger";

export function registerChatWsHandlers(
	chatRepo: IChatRepository,
	wsManager: IWsManager,
	wsRouter: IWsRouter,
) {
	wsRouter.register("chat:join", async (ws, data) => {
		try {
			const { chatId } = data as { chatId: string };
			const userId = ws.data.userId;
			if (!userId) return;

			const isMember = await chatRepo.isMember(chatId, userId);
			if (!isMember) {
				ws.send(JSON.stringify({ event: "error", data: { message: "Not a member of this chat" } }));
				return;
			}

			wsManager.join(chatId, ws);

			// Broadcast online status to other members in this room
			wsManager.broadcastToChatExcept(chatId, userId, {
				event: "chat:presence",
				data: { userId, status: "online" },
			});

			// Send presence of other online members to the joining user
			const roomMembers = wsManager.getOnlineUserIdsInChat(chatId);
			for (const memberId of roomMembers) {
				if (memberId !== userId) {
					ws.send(JSON.stringify({
						event: "chat:presence",
						data: { userId: memberId, status: "online" },
					}));
				}
			}
		} catch (err) {
			logger.error(err, "WS chat:join handler error");
		}
	});

	wsRouter.register("chat:leave", async (ws, data) => {
		try {
			const { chatId } = data as { chatId: string };
			wsManager.leave(chatId, ws);
		} catch (err) {
			logger.error(err, "WS chat:leave handler error");
		}
	});

	wsRouter.register("chat:typing", async (ws, data) => {
		try {
			const { chatId, isTyping } = data as { chatId: string; isTyping: boolean };
			const userId = ws.data.userId;
			if (!userId) return;

			wsManager.broadcastToChat(chatId, {
				event: "chat:typing",
				data: { chatId, userId, isTyping },
			});
		} catch (err) {
			logger.error(err, "WS chat:typing handler error");
		}
	});

	// chat:presence is handled automatically via chat:join and disconnect
}
