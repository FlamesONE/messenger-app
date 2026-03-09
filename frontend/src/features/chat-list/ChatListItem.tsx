import { useQueryClient } from "@tanstack/react-query";
import { Archive, BellOff, LogOut, Pin, Trash2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { showError, showInfo, showSuccess } from "@/shared/ui/custom-toast";
import { useSidebarSettings } from "@/shared/lib/sidebar-settings-store";
import { chatKeys, useLeaveChat, useDeleteChat, useChatStore } from "@/entities/chat";
import type { Chat, ChatMember } from "@/entities/chat";
import { formatMessageTime } from "@/shared/lib/format-date";
import { usePresenceStore } from "@/entities/user";
import { useTypingUsers, useUnreadCount } from "@/entities/message";
import { cn } from "@/shared/lib/utils";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { Badge } from "@/shared/ui/components/ui/badge";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/shared/ui/components/ui/context-menu";

interface ChatListItemProps {
	chat: Chat;
	isActive: boolean;
	currentUserId?: string;
	onSelect: (chatId: string) => void;
}

export const ChatListItem = memo(function ChatListItem({
	chat,
	isActive,
	currentUserId,
	onSelect,
}: ChatListItemProps) {
	const qc = useQueryClient();
	const invertedPanel = useSidebarSettings((s) => s.invertedPanel);
	const chatName = chat.name || (chat.isGroup ? "Группа" : chat.dmUser?.displayName || "Диалог");
	const unreadCount = useUnreadCount(chat.id);
	const dmUserId = !chat.isGroup ? chat.dmUser?.id : undefined;
	const isOnline = usePresenceStore((s) => (dmUserId ? s.isOnline(dmUserId) : false));
	const typingUserIds = useTypingUsers(chat.id);
	const leaveChat = useLeaveChat();
	const deleteChat = useDeleteChat();
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const activeChatId = useChatStore((s) => s.activeChatId);
	const [confirmLeave, setConfirmLeave] = useState(false);

	const typingLabel = useMemo(() => {
		if (typingUserIds.length === 0) return null;
		if (!chat.isGroup) return "печатает...";
		const members = qc.getQueryData<ChatMember[]>(chatKeys.members(chat.id));
		if (!members || typingUserIds.length > 2) {
			return `${typingUserIds.length} печатают...`;
		}
		const names = typingUserIds
			.map((id) => members.find((m) => m.id === id)?.displayName?.split(" ")[0] || "Кто-то")
			.join(", ");
		return `${names} ${typingUserIds.length === 1 ? "печатает" : "печатают"}...`;
	}, [typingUserIds, chat.isGroup, chat.id, qc]);

	const handleClick = useCallback(() => onSelect(chat.id), [onSelect, chat.id]);

	const handlePin = useCallback(() => {
		showInfo("Закрепление чатов скоро будет доступно");
	}, []);

	const handleMute = useCallback(() => {
		showInfo("Управление уведомлениями скоро будет доступно");
	}, []);

	const handleArchive = useCallback(() => {
		showInfo("Архивирование чатов скоро будет доступно");
	}, []);

	const handleLeave = useCallback(() => {
		setConfirmLeave(true);
	}, []);

	const handleConfirmLeave = useCallback(async () => {
		try {
			if (chat.isGroup) {
				await leaveChat.mutateAsync(chat.id);
				showSuccess("Вы покинули группу");
			} else {
				await deleteChat.mutateAsync(chat.id);
				showSuccess("Чат удалён");
			}
			if (activeChatId === chat.id) {
				setActiveChat(null);
			}
		} catch {
			showError(chat.isGroup ? "Не удалось покинуть группу" : "Не удалось удалить чат");
		}
		setConfirmLeave(false);
	}, [leaveChat, deleteChat, chat.id, chat.isGroup, activeChatId, setActiveChat]);

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<button
						type="button"
						onClick={handleClick}
						className={cn(
							"flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-150",
							isActive
								? "bg-panel-active text-panel-active-foreground"
								: "hover:bg-panel-secondary/70 active:scale-[0.98]",
						)}
					>
						<ChatAvatar name={chatName} avatarUrl={chat.dmUser?.avatarUrl} size="default" online={isOnline} />

						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-2">
								<span
									className={cn(
										"truncate text-sm font-semibold",
										isActive ? "text-panel-active-foreground" : "text-foreground",
									)}
								>
									{chatName}
								</span>
								{chat.lastMessage && (
									<span
										className={cn(
											"shrink-0 text-[11px] tabular-nums",
											isActive ? "text-panel-active-foreground/60" : "text-muted-foreground",
										)}
									>
										{formatMessageTime(chat.lastMessage.createdAt)}
									</span>
								)}
							</div>
							<div className="mt-0.5 flex items-center gap-1.5">
								{typingLabel ? (
									<p
										className={cn(
											"flex-1 truncate text-[13px] leading-snug",
											isActive ? "text-panel-active-foreground/60" : "text-primary",
										)}
									>
										{typingLabel}
									</p>
								) : chat.lastMessage ? (
									<p
										className={cn(
											"flex-1 truncate text-[13px] leading-snug",
											isActive ? "text-panel-active-foreground/60" : "text-muted-foreground",
										)}
									>
										{chat.lastMessage.senderId === currentUserId && (
											<span className={isActive ? "text-panel-active-foreground/80" : "text-foreground/60"}>Вы: </span>
										)}
										{chat.lastMessage.content || "Медиа"}
									</p>
								) : null}
								{unreadCount > 0 && !isActive && (
									<Badge className="size-5 justify-center rounded-full px-0 text-[10px] font-bold">
										{unreadCount > 99 ? "99+" : unreadCount}
									</Badge>
								)}
							</div>
						</div>
					</button>
				</ContextMenuTrigger>
				<ContextMenuContent className={invertedPanel ? "panel-surface-portal" : "sidebar-normal-portal"}>
					<ContextMenuItem onSelect={handlePin}>
						<Pin className="size-4" />
						Закрепить
					</ContextMenuItem>
					<ContextMenuItem onSelect={handleMute}>
						<BellOff className="size-4" />
						Без звука
					</ContextMenuItem>
					<ContextMenuItem onSelect={handleArchive}>
						<Archive className="size-4" />
						Архивировать
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem variant="destructive" onSelect={handleLeave}>
						{chat.isGroup ? (
							<><LogOut className="size-4" />Покинуть группу</>
						) : (
							<><Trash2 className="size-4" />Удалить чат</>
						)}
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<ConfirmDialog
				open={confirmLeave}
				onOpenChange={setConfirmLeave}
				title={chat.isGroup ? "Покинуть группу?" : "Удалить чат?"}
				description={
					chat.isGroup
						? "Вы будете удалены из группы и потеряете доступ к сообщениям."
						: "Чат и вся переписка будут удалены для обоих участников."
				}
				confirmLabel={chat.isGroup ? "Покинуть" : "Удалить"}
				variant="destructive"
				onConfirm={handleConfirmLeave}
			/>
		</>
	);
});
