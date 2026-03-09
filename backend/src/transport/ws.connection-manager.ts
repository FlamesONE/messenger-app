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

	broadcastToChatExcept(chatId: string, excludeUserId: string, message: WsMessage): void {
		const sockets = this.rooms.get(chatId);
		if (!sockets) return;

		const payload = JSON.stringify(message);
		for (const ws of sockets) {
			if (ws.data.userId !== excludeUserId) {
				ws.send(payload);
			}
		}
	}

	isUserOnline(userId: string): boolean {
		const sockets = this.userSockets.get(userId);
		return !!sockets && sockets.size > 0;
	}

	getUserSocketCount(userId: string): number {
		return this.userSockets.get(userId)?.size ?? 0;
	}

	broadcastToUser(userId: string, message: WsMessage): void {
		const sockets = this.userSockets.get(userId);
		if (!sockets) return;

		const payload = JSON.stringify(message);
		for (const ws of sockets) {
			ws.send(payload);
		}
	}

	getOnlineUserIdsInChat(chatId: string): string[] {
		const sockets = this.rooms.get(chatId);
		if (!sockets) return [];
		const ids = new Set<string>();
		for (const ws of sockets) {
			if (ws.data.userId) ids.add(ws.data.userId);
		}
		return Array.from(ids);
	}

	broadcastPresenceToRooms(userId: string, status: "online" | "offline"): void {
		const payload = JSON.stringify({
			event: "chat:presence",
			data: {
				userId,
				status,
				lastSeen: status === "offline" ? new Date().toISOString() : undefined,
			},
		});

		const userSocketSet = this.userSockets.get(userId);
		if (!userSocketSet || userSocketSet.size === 0) {
			// User already removed — iterate all rooms looking for their old sockets
			// (won't find any, so skip)
			return;
		}

		const notified = new Set<string>();
		for (const [, sockets] of this.rooms) {
			let userInRoom = false;
			for (const us of userSocketSet) {
				if (sockets.has(us)) {
					userInRoom = true;
					break;
				}
			}
			if (!userInRoom) continue;

			for (const ws of sockets) {
				const peerId = ws.data.userId;
				if (peerId && peerId !== userId && !notified.has(peerId)) {
					ws.send(payload);
					notified.add(peerId);
				}
			}
		}
	}
}
