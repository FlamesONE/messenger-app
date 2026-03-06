import { ArrowLeft, MoreVertical, Search } from "lucide-react";
import { memo } from "react";
import type { Chat } from "@/entities/chat/model/types";
import { ChatAvatar } from "@/shared/ui/chat-avatar";

interface ChatHeaderProps {
	chat: Chat | undefined;
	onBack?: () => void;
}

export const ChatHeader = memo(function ChatHeader({ chat, onBack }: ChatHeaderProps) {
	if (!chat) return null;

	const chatName = chat.name || (chat.isGroup ? "Группа" : "Диалог");

	return (
		<div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
			{onBack && (
				<button
					type="button"
					onClick={onBack}
					className="mr-1 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
				>
					<ArrowLeft className="size-5" />
				</button>
			)}

			<ChatAvatar name={chatName} size="default" />

			<div className="flex-1 min-w-0">
				<h2 className="truncate text-sm font-semibold leading-tight">{chatName}</h2>
				<p className="text-xs text-muted-foreground">{chat.isGroup ? "Группа" : "В сети"}</p>
			</div>

			<div className="flex items-center gap-1">
				<button
					type="button"
					className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
				>
					<Search className="size-4.5" />
				</button>
				<button
					type="button"
					className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
				>
					<MoreVertical className="size-4.5" />
				</button>
			</div>
		</div>
	);
});
