import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { messageKeys } from "@/entities/message";
import type { Message } from "@/entities/message";
import type { WsEventMap } from "@backend/shared/types/ws-events";

export function handleReaction(data: WsEventMap["message:reaction"], queryClient: QueryClient) {
	queryClient.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(data.chatId), (old) => {
		if (!old) return old;
		return {
			...old,
			pages: old.pages.map((page) =>
				page.map((m) => {
					if (m.id !== data.messageId) return m;
					const reactions = m.reactions ?? [];
					if (data.action === "added") {
						return { ...m, reactions: [...reactions, { emoji: data.emoji, userId: data.userId }] };
					}
					return {
						...m,
						reactions: reactions.filter((r) => !(r.emoji === data.emoji && r.userId === data.userId)),
					};
				}),
			),
		};
	});
}
