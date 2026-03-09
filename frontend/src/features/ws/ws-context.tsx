import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useWebSocket } from "./use-websocket";

interface WsContextValue {
	send: (event: string, data: Record<string, unknown>) => void;
	joinChat: (chatId: string) => void;
	leaveChat: (chatId: string) => void;
	sendTyping: (chatId: string, isTyping: boolean) => void;
}

const WsContext = createContext<WsContextValue | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
	const ws = useWebSocket();

	const value = useMemo<WsContextValue>(
		() => ({
			send: ws.send,
			joinChat: ws.joinChat,
			leaveChat: ws.leaveChat,
			sendTyping: ws.sendTyping,
		}),
		[ws.send, ws.joinChat, ws.leaveChat, ws.sendTyping],
	);

	return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWs() {
	const ctx = useContext(WsContext);
	if (!ctx) throw new Error("useWs must be used within WsProvider");
	return ctx;
}
