import { useAuthStore, useMe } from "@/entities/user";
import { useWebSocket } from "@/features/ws/use-websocket";
import { WsStatusIndicator } from "@/shared/ui/ws-status";
import { ChatView } from "@/widgets/chat-view/ChatView";
import { Sidebar } from "@/widgets/sidebar/Sidebar";

export function MessengerPage() {
	const token = useAuthStore((s) => s.token);
	useMe(!!token);
	useWebSocket();

	return (
		<div className="relative flex h-screen overflow-hidden bg-background">
			<Sidebar />
			<ChatView />
			<WsStatusIndicator />
		</div>
	);
}
