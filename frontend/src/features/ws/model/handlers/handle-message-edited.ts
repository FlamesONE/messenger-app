import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { messageKeys } from "@/entities/message";
import type { Message } from "@/entities/message";
import type { WsEventMap } from "@backend/shared/types/ws-events";

export function handleMessageEdited(data: WsEventMap["message:edited"], queryClient: QueryClient) {
	queryClient.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(data.chatId), (old) => {
		if (!old) return old;
		return {
			...old,
			pages: old.pages.map((page) =>
				page.map((m) =>
					m.id === data.messageId
						? { ...m, content: data.content, editedAt: data.editedAt, updatedAt: data.editedAt }
						: m,
				),
			),
		};
	});
}
