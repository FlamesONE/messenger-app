import type { WsMessage } from "@/shared/types/ws-events";
import type { IWsManager, IWsSocket } from "@/transport/ws.types";

export class WsConnectionManager implements IWsManager {
	private rooms = new Map<string, Set<IWsSocket>>();
	private userSockets = new Map<string, Set<IWsSocket>>();

	registerUser(userId: string, ws: IWsSocket): void {
		if (!this.userSockets.has(userId)) {
			this.userSockets.set(userId, new Set());
		}
		this.userSockets.get(userId)!.add(ws);
	}

	join(chatId: string, ws: IWsSocket): void {
		if (!this.rooms.has(chatId)) {
			this.rooms.set(chatId, new Set());
		}
		this.rooms.get(chatId)!.add(ws);
	}

	leave(chatId: string, ws: IWsSocket): void {
		this.rooms.get(chatId)?.delete(ws);
	}

	removeFromAll(ws: IWsSocket): void {
		for (const [, sockets] of this.rooms) {
			sockets.delete(ws);
		}
		const userId = ws.data.userId;
		if (userId) {
			const userSet = this.userSockets.get(userId);
			if (userSet) {
				userSet.delete(ws);
				if (userSet.size === 0) this.userSockets.delete(userId);
			}
		}
	}

	broadcastToChat(chatId: string, message: WsMessage): void {
		const sockets = this.rooms.get(chatId);
		if (!sockets) return;

		const payload = JSON.stringify(message);
		for (const ws of sockets) {
			ws.send(payload);
		}
	}

	isUserOnline(userId: string): boolean {
		const sockets = this.userSockets.get(userId);
		return !!sockets && sockets.size > 0;
	}

	broadcastToUser(userId: string, message: WsMessage): void {
		const sockets = this.userSockets.get(userId);
		if (!sockets) return;

		const payload = JSON.stringify(message);
		for (const ws of sockets) {
			ws.send(payload);
		}
	}
}
