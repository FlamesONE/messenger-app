import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import type { Message } from "@/entities/message";
import { messageKeys } from "@/entities/message";
import type { WsEventMap } from "@backend/shared/types/ws-events";

export function handleMessageRead(
	data: WsEventMap["message:read"],
	qc: QueryClient,
) {
	qc.setQueryData<InfiniteData<Message[]>>(
		messageKeys.byChat(data.chatId),
		(old) => {
			if (!old) return old;
			return {
				...old,
				pages: old.pages.map((page) =>
					page.map((msg) => {
						if (msg.id !== data.messageId) return msg;
						if (msg.readBy?.includes(data.readBy)) return msg;
						return { ...msg, readBy: [...(msg.readBy ?? []), data.readBy] };
					}),
				),
			};
		},
	);
}
