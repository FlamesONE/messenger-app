import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { chatKeys } from "@/entities/chat/api/queries";
import type { Chat } from "@/entities/chat/model/types";
import { messageKeys } from "@/entities/message/api/queries";
import type { Message } from "@/entities/message/model/types";
import { useAuthStore } from "@/entities/user/model/store";
import { useWsStatus } from "@/shared/lib/ws-status";

interface WsMessage {
	event: string;
	data: Record<string, unknown>;
}

export function useWebSocket() {
	const wsRef = useRef<WebSocket | null>(null);
	const token = useAuthStore((s) => s.token);
	const queryClient = useQueryClient();
	const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();
	const isConnecting = useRef(false);
	const setStatus = useWsStatus((s) => s.setStatus);

	const connect = useCallback(() => {
		if (!token || isConnecting.current) return;
		isConnecting.current = true;
		setStatus("connecting");

		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

		ws.onopen = () => {
			setStatus("authenticating");
			ws.send(JSON.stringify({ event: "auth", data: { token } }));
		};

		ws.onmessage = (e) => {
			try {
				const msg: WsMessage = JSON.parse(e.data);

				switch (msg.event) {
					case "auth:success":
						isConnecting.current = false;
						setStatus("connected");
						break;

					case "auth:error":
						isConnecting.current = false;
						setStatus("error");
						ws.close();
						break;

					case "message:new": {
						const d = msg.data as unknown as Message;

						// Add to messages cache
						queryClient.setQueryData<InfiniteData<Message[]>>(
							messageKeys.byChat(d.chatId),
							(old) => {
								if (!old) return old;
								const firstPage = old.pages[0] || [];
								if (firstPage.some((m) => m.id === d.id)) return old;
								return {
									...old,
									pages: [[d, ...firstPage], ...old.pages.slice(1)],
								};
							},
						);

						// Update last message in chats cache
						queryClient.setQueryData<Chat[]>(chatKeys.all, (old) => {
							if (!old) return old;
							return old
								.map((c) =>
									c.id === d.chatId
										? {
												...c,
												lastMessage: {
													content: d.content,
													senderId: d.senderId,
													createdAt: d.createdAt,
												},
												updatedAt: d.createdAt,
											}
										: c,
								)
								.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
						});
						break;
					}

					case "message:deleted": {
						const { chatId, messageId } = msg.data as {
							chatId: string;
							messageId: string;
						};
						queryClient.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(chatId), (old) => {
							if (!old) return old;
							return {
								...old,
								pages: old.pages.map((page) => page.filter((m) => m.id !== messageId)),
							};
						});
						break;
					}
				}
			} catch {
				/* ignore parse errors */
			}
		};

		ws.onclose = () => {
			isConnecting.current = false;
			setStatus("disconnected");
			reconnectTimeout.current = setTimeout(connect, 3000);
		};

		ws.onerror = () => {
			setStatus("error");
			ws.close();
		};

		wsRef.current = ws;
	}, [token, queryClient, setStatus]);

	useEffect(() => {
		connect();
		return () => {
			clearTimeout(reconnectTimeout.current);
			isConnecting.current = false;
			wsRef.current?.close();
		};
	}, [connect]);

	return wsRef;
}
