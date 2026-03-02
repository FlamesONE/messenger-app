import type { WsMessage } from "@/shared/types/ws-events";

export interface WsSocket {
	id: string;
	send: (data: unknown) => void;
	data: { userId?: string };
}

export class WsConnectionManager {
	private connections = new Map<string, Set<WsSocket>>();

	join(chatId: string, ws: WsSocket): void {
		if (!this.connections.has(chatId)) {
			this.connections.set(chatId, new Set());
		}
		const room = this.connections.get(chatId);
		if (room) room.add(ws);
	}

	leave(chatId: string, ws: WsSocket): void {
		this.connections.get(chatId)?.delete(ws);
	}

	removeFromAll(ws: WsSocket): void {
		for (const [, sockets] of this.connections) {
			sockets.delete(ws);
		}
	}

	broadcastToChat(chatId: string, message: WsMessage): void {
		const sockets = this.connections.get(chatId);
		if (!sockets) return;

		const payload = JSON.stringify(message);
		for (const ws of sockets) {
			ws.send(payload);
		}
	}

	broadcastToUser(userId: string, message: WsMessage): void {
		const payload = JSON.stringify(message);
		for (const [, sockets] of this.connections) {
			for (const ws of sockets) {
				if (ws.data.userId === userId) {
					ws.send(payload);
				}
			}
		}
	}
}

export const wsManager = new WsConnectionManager();
