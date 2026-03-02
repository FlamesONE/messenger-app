import { logger } from "@/shared/logger";
import { wsManager } from "@/transport/ws.connection-manager";
import { registerWsHandler } from "@/transport/ws.gateway";

export function registerChatWsHandlers() {
	registerWsHandler("chat:typing", async (_ws, data) => {
		try {
			const { chatId, userId, isTyping } = data as {
				chatId: string;
				userId: string;
				isTyping: boolean;
			};

			wsManager.broadcastToChat(chatId, {
				event: "chat:typing",
				data: { chatId, userId, isTyping },
			});
		} catch (err) {
			logger.error(err, "WS chat:typing handler error");
		}
	});

	registerWsHandler("chat:presence", async (_ws, data) => {
		try {
			const { userId, status, lastSeen } = data as {
				userId: string;
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
