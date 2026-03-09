import { useTypingStore } from "@/entities/message";
import type { WsEventMap } from "@backend/shared/types/ws-events";

export function handleTyping(data: WsEventMap["chat:typing"], userId: string | undefined) {
	if (data.userId !== userId) {
		useTypingStore.getState().setTyping(data.chatId, data.userId, data.isTyping);
	}
}
