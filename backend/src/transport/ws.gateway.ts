import { Elysia } from "elysia";
import { logger } from "@/shared/logger";
import type { WsEventName, WsMessage } from "@/shared/types/ws-events";
import type { WsSocket } from "./ws.connection-manager";
import { wsManager } from "./ws.connection-manager";

type WsHandler = (ws: WsSocket, data: unknown) => void | Promise<void>;

const handlers = new Map<string, WsHandler>();

export function registerWsHandler(event: WsEventName, handler: WsHandler) {
	handlers.set(event, handler);
}

export function createWsGateway() {
	return new Elysia({ name: "ws-gateway" }).ws("/ws", {
		open(ws) {
			logger.debug({ id: ws.id }, "WebSocket connected");
		},

		message(ws, raw) {
			try {
				const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
				const { event, data } = parsed as WsMessage;

				const handler = handlers.get(event);
				if (handler) {
					handler(ws as unknown as WsSocket, data);
				} else {
					logger.warn({ event }, "Unknown WS event");
				}
			} catch (err) {
				logger.error(err, "Failed to process WS message");
			}
		},

		close(ws) {
			wsManager.removeFromAll(ws as unknown as WsSocket);
			logger.debug({ id: ws.id }, "WebSocket disconnected");
		},
	});
}
