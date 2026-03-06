import { memo } from "react";
import type { Chat } from "@/entities/chat/model/types";
import { formatMessageTime } from "@/shared/lib/format-date";
import { cn } from "@/shared/lib/utils";
import { ChatAvatar } from "@/shared/ui/chat-avatar";

interface ChatListItemProps {
	chat: Chat;
	isActive: boolean;
	currentUserId?: string;
	onClick: () => void;
}

export const ChatListItem = memo(function ChatListItem({
	chat,
	isActive,
	currentUserId,
	onClick,
}: ChatListItemProps) {
	const chatName = chat.name || (chat.isGroup ? "Группа" : "Диалог");

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
				isActive ? "bg-tg-sidebar-active text-white" : "hover:bg-secondary/60",
			)}
		>
			<ChatAvatar name={chatName} size="default" />

			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span
						className={cn(
							"truncate text-sm font-medium",
							isActive ? "text-white" : "text-foreground",
						)}
					>
						{chatName}
					</span>
					{chat.lastMessage && (
						<span
							className={cn(
								"shrink-0 text-[11px]",
								isActive ? "text-white/70" : "text-muted-foreground",
							)}
						>
							{formatMessageTime(chat.lastMessage.createdAt)}
						</span>
					)}
				</div>
				{chat.lastMessage && (
					<p
						className={cn(
							"mt-0.5 truncate text-[13px] leading-snug",
							isActive ? "text-white/70" : "text-muted-foreground",
						)}
					>
						{chat.lastMessage.senderId === currentUserId && (
							<span className={isActive ? "text-white/90" : "text-foreground/70"}>Вы: </span>
						)}
						{chat.lastMessage.content || "Медиа"}
					</p>
				)}
			</div>
		</button>
	);
});
