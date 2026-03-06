export interface WsEventMap {
	"message:new": {
		chatId: string;
		messageId: string;
		senderId: string;
		content: string;
		media: { url: string; type: string; name: string }[];
		createdAt: string;
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
		content: string;
	};
}

export type WsEventName = keyof WsEventMap;

export interface WsMessage<T extends WsEventName = WsEventName> {
	event: T;
	data: WsEventMap[T];
}
