import { Elysia } from "elysia";
import type { IWsManager, IWsRouter, IWsSocket } from "@/transport/ws.types";
import type { WsEventName, WsMessage } from "@/shared/types/ws-events";
import { logger } from "@/shared/logger";
import { jwtPlugin } from "./auth.guard";

export function createWsGateway(wsManager: IWsManager, wsRouter: IWsRouter) {
	return new Elysia({ name: "ws-gateway" })
		.use(jwtPlugin)
		.ws("/ws", {
			open(ws) {
				logger.debug({ id: ws.id }, "WebSocket connected, awaiting auth");
			},

			async message(ws, raw) {
				try {
					const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
					const { event, data } = parsed as WsMessage;

					if (event === "auth") {
						const token = (data as { token?: string }).token;
						if (!token) {
							ws.send(JSON.stringify({ event: "auth:error", data: { message: "Token required" } }));
							ws.close(4001, "Unauthorized");
							return;
						}

						const jwt = (ws.data as { jwt: { verify: (t: string) => Promise<{ sub?: string } | false> } }).jwt;
						const payload = await jwt.verify(token);

						if (!payload || !payload.sub) {
							ws.send(JSON.stringify({ event: "auth:error", data: { message: "Invalid token" } }));
							ws.close(4001, "Unauthorized");
							return;
						}

						const userId = payload.sub as string;
						(ws.data as { userId?: string }).userId = userId;
						wsManager.registerUser(userId, ws as unknown as IWsSocket);
						ws.send(JSON.stringify({ event: "auth:success", data: { userId } }));
						logger.debug({ id: ws.id, userId }, "WebSocket authenticated");
						return;
					}

					const userId = (ws.data as { userId?: string }).userId;
					if (!userId) {
						ws.send(JSON.stringify({ event: "auth:error", data: { message: "Not authenticated" } }));
						return;
					}

					await wsRouter.dispatch(event as WsEventName, ws as unknown as IWsSocket, data);
				} catch (err) {
					logger.error(err, "Failed to process WS message");
				}
			},

			close(ws) {
				wsManager.removeFromAll(ws as unknown as IWsSocket);
				logger.debug({ id: ws.id }, "WebSocket disconnected");
			},
		});
}
