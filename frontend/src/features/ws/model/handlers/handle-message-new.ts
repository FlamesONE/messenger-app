import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { chatKeys, sortChatsByLastActivity, useChatStore } from "@/entities/chat";
import type { Chat } from "@/entities/chat";
import { messageKeys, useTypingStore, useUnreadStore } from "@/entities/message";
import type { Message } from "@/entities/message";
import { showNotification, playNotificationSound } from "@/shared/lib/notifications";
import { showMessageToast } from "@/shared/ui/custom-toast";
import type { WsEventMap } from "@backend/shared/types/ws-events";

const recentlyProcessed = new Set<string>();

/** IDs already notified via notification:new — skip toast in message:new */
export const notifiedMessages = new Set<string>();

export function handleMessageNew(
	data: WsEventMap["message:new"],
	queryClient: QueryClient,
	userId: string | undefined,
) {
	if (data.senderId === userId) return;
	if (recentlyProcessed.has(data.messageId)) return;
	recentlyProcessed.add(data.messageId);
	setTimeout(() => recentlyProcessed.delete(data.messageId), 5000);

	const msg: Message = {
		id: data.messageId,
		chatId: data.chatId,
		senderId: data.senderId,
		content: data.content,
		media: (data.media ?? []).map((m) => ({ ...m, key: "", size: 0 })),
		reactions: [],
		readBy: [],
		replyTo: data.replyTo ?? null,
		editedAt: null,
		createdAt: data.createdAt,
		updatedAt: data.createdAt,
		deletedAt: null,
	};

	const activeChatId = useChatStore.getState().activeChatId;

	queryClient.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(msg.chatId), (old) => {
		if (!old) return old;
		const firstPage = old.pages[0] || [];
		if (firstPage.some((m) => m.id === msg.id)) return old;
		return {
			...old,
			pages: [[msg, ...firstPage], ...old.pages.slice(1)],
		};
	});

	const chats = queryClient.getQueryData<Chat[]>(chatKeys.all);
	const chatExists = chats?.some((c) => c.id === msg.chatId);

	if (!chatExists) {
		queryClient.invalidateQueries({ queryKey: chatKeys.all });
	} else {
		queryClient.setQueryData<Chat[]>(chatKeys.all, (old) => {
			if (!old) return old;
			return sortChatsByLastActivity(
				old.map((c) =>
					c.id === msg.chatId
						? {
								...c,
								lastMessage: {
									content: msg.content,
									senderId: msg.senderId,
									createdAt: msg.createdAt,
								},
								updatedAt: msg.createdAt,
							}
						: c,
				),
			);
		});
	}

	if (msg.chatId !== activeChatId) {
		useUnreadStore.getState().increment(msg.chatId);

		// Show toast only if notification:new hasn't already handled it
		if (!notifiedMessages.has(msg.id)) {
			const chat = chats?.find((c) => c.id === msg.chatId);
			const senderLabel = chat?.dmUser?.displayName || "Новое сообщение";
			const senderAvatar = chat?.dmUser?.avatarUrl ?? undefined;
			const chatName = chat?.isGroup ? chat.name ?? undefined : undefined;
			const body = msg.content || "Медиа";

			showMessageToast(senderLabel, body, {
				senderAvatar,
				chatName,
				onOpen: () => useChatStore.getState().setActiveChat(msg.chatId),
			});

			showNotification(senderLabel, body, {
				icon: senderAvatar || "/icon-192.png",
			});
			playNotificationSound();
		}
		notifiedMessages.delete(msg.id);
	}

	useTypingStore.getState().setTyping(msg.chatId, msg.senderId, false);
}
