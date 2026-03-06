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

	wsRouter.register("chat:presence", async (ws, data) => {
		try {
			const userId = ws.data.userId;
			if (!userId) return;

			const { status, lastSeen } = data as {
				status: "online" | "offline";
				lastSeen?: string;
			};

			wsManager.broadcastToUser(userId, {
				event: "chat:presence",
				data: { userId, status, lastSeen },
			});
		} catch (err) {
			logger.error(err, "WS chat:presence handler error");
		}
	});
}
