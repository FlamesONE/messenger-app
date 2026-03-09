export interface WsEventMap {
	"message:new": {
		chatId: string;
		messageId: string;
		senderId: string;
		content: string;
		media: { url: string; type: string; name: string }[];
		replyTo: string | null;
		createdAt: string;
	};
	"message:edited": {
		chatId: string;
		messageId: string;
		content: string;
		editedAt: string;
	};
	"message:deleted": {
		chatId: string;
		messageId: string;
	};
	"message:read": {
		chatId: string;
		messageId: string;
		readBy: string;
	};
	"chat:join": {
		chatId: string;
	};
	"chat:leave": {
		chatId: string;
	};
	auth: {
		token: string;
	};
	"auth:success": {
		userId: string;
	};
	"auth:error": {
		message: string;
	};
	"chat:typing": {
		chatId: string;
		userId: string;
		isTyping: boolean;
	};
	"chat:presence": {
		userId: string;
		status: "online" | "offline";
		lastSeen?: string;
	};
	"notification:new": {
		chatId: string;
		messageId: string;
		senderName: string;
		senderAvatar: string | null;
		content: string;
	};
	"message:reaction": {
		chatId: string;
		messageId: string;
		userId: string;
		emoji: string;
		action: "added" | "removed";
	};
	"user:updated": {
		userId: string;
		displayName: string;
		avatarUrl: string | null;
		username: string;
	};
}

export type WsEventName = keyof WsEventMap;

export interface WsMessage<T extends WsEventName = WsEventName> {
	event: T;
	data: WsEventMap[T];
}
