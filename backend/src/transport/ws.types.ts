import type { WsEventName, WsMessage } from "@/shared/types/ws-events";

export interface IWsSocket {
	id: string;
	send: (data: unknown) => void;
	data: { userId?: string };
}

export type WsHandler = (ws: IWsSocket, data: unknown) => void | Promise<void>;

export interface IWsRouter {
	register(event: WsEventName, handler: WsHandler): void;
	dispatch(event: WsEventName, ws: IWsSocket, data: unknown): Promise<void>;
}

export interface IWsManager {
	registerUser(userId: string, ws: IWsSocket): void;
	join(chatId: string, ws: IWsSocket): void;
	leave(chatId: string, ws: IWsSocket): void;
	removeFromAll(ws: IWsSocket): void;
	broadcastToChat(chatId: string, message: WsMessage): void;
	broadcastToUser(userId: string, message: WsMessage): void;
	isUserOnline(userId: string): boolean;
}
