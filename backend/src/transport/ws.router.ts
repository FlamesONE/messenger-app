import type { WsEventName } from "@/shared/types/ws-events";
import type { IWsRouter, IWsSocket, WsHandler } from "@/transport/ws.types";
import { logger } from "@/shared/logger";

export class WsRouter implements IWsRouter {
	private handlers = new Map<string, WsHandler>();

	register(event: WsEventName, handler: WsHandler): void {
		this.handlers.set(event, handler);
	}

	async dispatch(event: WsEventName, ws: IWsSocket, data: unknown): Promise<void> {
		const handler = this.handlers.get(event);
		if (handler) {
			await handler(ws, data);
		} else {
			logger.warn({ event }, "Unknown WS event");
		}
	}
}
