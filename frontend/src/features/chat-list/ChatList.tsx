import { MessageSquarePlus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useChatStore, useChats } from "@/entities/chat";
import { useAuthStore } from "@/entities/user";
import { Skeleton } from "@/shared/ui/components/ui/skeleton";
import { ChatListItem } from "./ChatListItem";

interface ChatListProps {
	searchQuery: string;
}

export function ChatList({ searchQuery }: ChatListProps) {
	const { data: chats = [], isLoading } = useChats();
	const activeChatId = useChatStore((s) => s.activeChatId);
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const userId = useAuthStore((s) => s.user?.id);

	const filteredChats = useMemo(() => {
		if (!searchQuery.trim()) return chats;
		const q = searchQuery.toLowerCase();
		return chats.filter(
			(c) => c.name?.toLowerCase().includes(q) || c.lastMessage?.content.toLowerCase().includes(q),
		);
	}, [chats, searchQuery]);

	const handleSelect = useCallback((chatId: string) => setActiveChat(chatId), [setActiveChat]);

	if (isLoading && chats.length === 0) {
		return (
			<div className="flex flex-col gap-1 p-2">
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<div key={i} className="flex items-center gap-3 rounded-lg px-2.5 py-2">
						<Skeleton className="size-10 shrink-0 rounded-full" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-3.5 w-28" />
							<Skeleton className="h-3 w-40" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (filteredChats.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
				<MessageSquarePlus className="size-10 text-muted-foreground/40" />
				<p className="text-sm text-muted-foreground text-center">
					{searchQuery ? "Ничего не найдено" : "Пока нет чатов"}
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-0.5 overflow-y-auto px-2 py-1">
			{filteredChats.map((chat) => (
				<ChatListItem
					key={chat.id}
					chat={chat}
					isActive={chat.id === activeChatId}
					currentUserId={userId}
					onClick={() => handleSelect(chat.id)}
				/>
			))}
		</div>
	);
}
