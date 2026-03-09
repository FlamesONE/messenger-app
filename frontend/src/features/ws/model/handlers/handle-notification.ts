import { useChatStore } from "@/entities/chat";
import { chatKeys } from "@/entities/chat/api/queries";
import type { Chat } from "@/entities/chat/model/types";
import { queryClient } from "@/shared/api/query-client";
import { showNotification, playNotificationSound } from "@/shared/lib/notifications";
import { showMessageToast } from "@/shared/ui/custom-toast";
import type { WsEventMap } from "@backend/shared/types/ws-events";
import { notifiedMessages } from "./handle-message-new";

export function handleNotification(data: WsEventMap["notification:new"]) {
	const activeChatId = useChatStore.getState().activeChatId;
	if (data.chatId === activeChatId) return;

	// Mark as notified so handleMessageNew won't duplicate
	notifiedMessages.add(data.messageId);
	setTimeout(() => notifiedMessages.delete(data.messageId), 10000);

	const chats = queryClient.getQueryData<Chat[]>(chatKeys.all);
	const chat = chats?.find((c) => c.id === data.chatId);
	const chatName = chat?.isGroup ? chat.name ?? undefined : undefined;

	showMessageToast(data.senderName, data.content || "Медиа", {
		senderAvatar: data.senderAvatar ?? undefined,
		chatName,
		onOpen: () => useChatStore.getState().setActiveChat(data.chatId),
	});

	showNotification(data.senderName, data.content || "Медиа", {
		icon: data.senderAvatar || "/icon-192.png",
	});
	playNotificationSound();
}
