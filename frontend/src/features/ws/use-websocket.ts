import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { chatKeys } from "@/entities/chat";
import type { Chat } from "@/entities/chat";
import { useAuthStore } from "@/entities/user";
import { useWsStatus } from "@/features/ws/model/ws-status";
import { getWsUrl } from "@/shared/lib/app-settings-store";
import type { WsEventMap } from "@backend/shared/types/ws-events";
import {
	handleMessageDeleted,
	handleMessageEdited,
	handleMessageNew,
	handleMessageRead,
	handleNotification,
	handlePresence,
	handleReaction,
	handleTyping,
	handleUserUpdated,
} from "./model/handlers";

interface RawWsMessage {
	event: string;
	data: unknown;
}

function wsData<E extends keyof WsEventMap>(data: unknown): WsEventMap[E] {
	return data as WsEventMap[E];
}

let globalWs: {
	send: (event: string, data: Record<string, unknown>) => void;
	joinChat: (chatId: string) => void;
	leaveChat: (chatId: string) => void;
	sendTyping: (chatId: string, isTyping: boolean) => void;
} | null = null;

export function getWsActions() {
	return globalWs;
}

export function useWebSocket() {
	const wsRef = useRef<WebSocket | null>(null);
	const token = useAuthStore((s) => s.token);
	const userId = useAuthStore((s) => s.user?.id);
	const queryClient = useQueryClient();
	const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
	const reconnectDelay = useRef(1000);
	const isConnecting = useRef(false);
	const setStatus = useWsStatus((s) => s.setStatus);
	const joinedChats = useRef<Set<string>>(new Set());

	const tokenRef = useRef(token);
	tokenRef.current = token;
	const userIdRef = useRef(userId);
	userIdRef.current = userId;
	const queryClientRef = useRef(queryClient);
	queryClientRef.current = queryClient;

	const send = useCallback((event: string, data: Record<string, unknown>) => {
		const ws = wsRef.current;
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ event, data }));
		}
	}, []);

	const joinChat = useCallback(
		(chatId: string) => {
			if (!joinedChats.current.has(chatId)) {
				send("chat:join", { chatId });
				joinedChats.current.add(chatId);
			}
		},
		[send],
	);

	const leaveChat = useCallback(
		(chatId: string) => {
			if (joinedChats.current.has(chatId)) {
				send("chat:leave", { chatId });
				joinedChats.current.delete(chatId);
			}
		},
		[send],
	);

	const sendTyping = useCallback(
		(chatId: string, isTyping: boolean) => {
			send("chat:typing", { chatId, isTyping });
		},
		[send],
	);

	useEffect(() => {
		globalWs = { send, joinChat, leaveChat, sendTyping };
		return () => {
			globalWs = null;
		};
	}, [send, joinChat, leaveChat, sendTyping]);

	const connect = useCallback(() => {
		const currentToken = tokenRef.current;
		if (!currentToken || isConnecting.current) return;
		isConnecting.current = true;
		setStatus("connecting");

		const ws = new WebSocket(getWsUrl());

		ws.onopen = () => {
			setStatus("authenticating");
			ws.send(JSON.stringify({ event: "auth", data: { token: tokenRef.current } }));
		};

		ws.onmessage = (e) => {
			try {
				const msg: RawWsMessage = JSON.parse(e.data);
				const qc = queryClientRef.current;
				const uid = userIdRef.current;

				switch (msg.event) {
					case "auth:success": {
						isConnecting.current = false;
						reconnectDelay.current = 1000;
						setStatus("connected");
						joinedChats.current.clear();

						const chats = qc.getQueryData<Chat[]>(chatKeys.all);
						if (chats) {
							for (const chat of chats) {
								joinChat(chat.id);
							}
						}
						break;
					}

					case "auth:error":
						isConnecting.current = false;
						setStatus("error");
						ws.close();
						break;

					case "message:new":
						handleMessageNew(wsData<"message:new">(msg.data), qc, uid);
						break;

					case "message:edited":
						handleMessageEdited(wsData<"message:edited">(msg.data), qc);
						break;

					case "message:deleted":
						handleMessageDeleted(wsData<"message:deleted">(msg.data), qc);
						break;

					case "message:read":
						handleMessageRead(wsData<"message:read">(msg.data), qc);
						break;

					case "message:reaction":
						handleReaction(wsData<"message:reaction">(msg.data), qc);
						break;

					case "notification:new":
						handleNotification(wsData<"notification:new">(msg.data));
						break;

					case "chat:typing":
						handleTyping(wsData<"chat:typing">(msg.data), uid);
						break;

					case "chat:presence":
						handlePresence(wsData<"chat:presence">(msg.data));
						break;

					case "user:updated":
						handleUserUpdated(wsData<"user:updated">(msg.data), qc);
						break;
				}
			} catch {
				/* ignore parse errors */
			}
		};

		ws.onclose = () => {
			isConnecting.current = false;
			joinedChats.current.clear();
			setStatus("disconnected");
			const delay = reconnectDelay.current;
			reconnectDelay.current = Math.min(delay * 2, 30000); // backoff: 1s → 2s → 4s → ... → 30s max
			reconnectTimeout.current = setTimeout(connect, delay);
		};

		ws.onerror = () => {
			setStatus("error");
			ws.close();
		};

		wsRef.current = ws;
	}, [setStatus, joinChat]);

	useEffect(() => {
		connect();
		return () => {
			clearTimeout(reconnectTimeout.current);
			isConnecting.current = false;
			wsRef.current?.close();
		};
	}, [connect]);

	return { wsRef, send, joinChat, leaveChat, sendTyping };
}
