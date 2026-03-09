import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuthStore, useMe } from "@/entities/user";
import { useChatStore, useChats } from "@/entities/chat";
import { WsProvider } from "@/features/ws";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import { WsStatusIndicator } from "@/features/ws/ui/WsStatusIndicator";
import { ChatView } from "@/widgets/chat-view/ui/ChatView";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";

const APP_NAME = "Fasty";

function useSyncChatUrl() {
	const { chatId: urlChatId } = useParams<{ chatId: string }>();
	const activeChatId = useChatStore((s) => s.activeChatId);
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const navigate = useNavigate();
	const skipNavRef = useRef(false);

	// URL → store: when user navigates directly to /chat/:chatId
	useEffect(() => {
		if (urlChatId && urlChatId !== activeChatId) {
			skipNavRef.current = true;
			setActiveChat(urlChatId);
		}
		if (!urlChatId && activeChatId) {
			skipNavRef.current = true;
			setActiveChat(null);
		}
	}, [urlChatId]);

	// store → URL: when user selects chat via UI
	useEffect(() => {
		if (skipNavRef.current) {
			skipNavRef.current = false;
			return;
		}
		const target = activeChatId ? `/chat/${activeChatId}` : "/";
		navigate(target, { replace: true });
	}, [activeChatId]);
}

function useChatTitle() {
	const activeChatId = useChatStore((s) => s.activeChatId);
	const pendingDmUser = useChatStore((s) => s.pendingDmUser);
	const { data: chats } = useChats();

	useEffect(() => {
		if (pendingDmUser) {
			document.title = `${pendingDmUser.displayName} — ${APP_NAME}`;
			return;
		}
		if (!activeChatId || !chats) {
			document.title = APP_NAME;
			return;
		}
		const chat = chats.find((c) => c.id === activeChatId);
		if (!chat) {
			document.title = APP_NAME;
			return;
		}
		const name = chat.name || chat.dmUser?.displayName || "Чат";
		document.title = `${name} — ${APP_NAME}`;
	}, [activeChatId, chats, pendingDmUser]);
}

export function MessengerPage() {
	const token = useAuthStore((s) => s.token);
	useMe(!!token);
	useSyncChatUrl();
	useChatTitle();

	return (
		<WsProvider>
			<div className="relative flex h-screen overflow-hidden bg-background max-lg:p-0 lg:p-3 gap-0">
				<ErrorBoundary>
					<Sidebar />
				</ErrorBoundary>
				<ErrorBoundary>
					<ChatView />
				</ErrorBoundary>
				<WsStatusIndicator />
			</div>
		</WsProvider>
	);
}
