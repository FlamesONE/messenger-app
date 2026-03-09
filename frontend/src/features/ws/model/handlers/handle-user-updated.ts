import type { QueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/entities/chat";
import type { Chat } from "@/entities/chat";
import type { WsEventMap } from "@backend/shared/types/ws-events";

export function handleUserUpdated(
	data: WsEventMap["user:updated"],
	queryClient: QueryClient,
) {
	queryClient.setQueryData<Chat[]>(chatKeys.all, (old) => {
		if (!old) return old;
		return old.map((chat) => {
			if (chat.dmUser?.id === data.userId) {
				return {
					...chat,
					dmUser: {
						...chat.dmUser,
						displayName: data.displayName,
						avatarUrl: data.avatarUrl,
						username: data.username,
					},
				};
			}
			return chat;
		});
	});

	queryClient.invalidateQueries({
		queryKey: ["chats"],
		predicate: (query) =>
			query.queryKey.length === 3 && query.queryKey[2] === "members",
	});
}
