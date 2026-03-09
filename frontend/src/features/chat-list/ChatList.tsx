import { MessageSquarePlus } from "lucide-react";
import { memo, useMemo } from "react";
import { useChatStore, useChats } from "@/entities/chat";
import { useAuthStore } from "@/entities/user";
import { ChatListItem } from "./ChatListItem";

interface ChatListProps {
	searchQuery: string;
	filterTab?: 'all' | 'personal' | 'groups';
}

export const ChatList = memo(function ChatList({ searchQuery, filterTab }: ChatListProps) {
	const { data: chats = [], isLoading } = useChats();
	const activeChatId = useChatStore((s) => s.activeChatId);
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const userId = useAuthStore((s) => s.user?.id);

	const filteredChats = useMemo(() => {
		if (!searchQuery.trim()) return chats;
		const q = searchQuery.toLowerCase();
		return chats.filter(
			(c) =>
				c.name?.toLowerCase().includes(q) ||
				c.dmUser?.displayName.toLowerCase().includes(q) ||
				c.dmUser?.username.toLowerCase().includes(q) ||
				c.lastMessage?.content.toLowerCase().includes(q),
		);
	}, [chats, searchQuery]);

	const tabFiltered = useMemo(() => {
		if (!filterTab || filterTab === 'all') return filteredChats;
		if (filterTab === 'personal') return filteredChats.filter(c => !c.isGroup);
		return filteredChats.filter(c => c.isGroup);
	}, [filteredChats, filterTab]);

	if (isLoading && chats.length === 0) {
		const widths = [0.85, 0.65, 0.92, 0.55, 0.78, 0.7, 0.88, 0.6];
		return (
			<div className="flex flex-col gap-0.5 px-2 py-1">
				{widths.map((w, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<div key={i} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
						<div className="size-10 shrink-0 rounded-full skeleton-shimmer" />
						<div className="flex-1 min-w-0 space-y-2">
							<div
								className="h-3.5 rounded-md skeleton-shimmer"
								style={{ width: `${w * 60}%` }}
							/>
							<div
								className="h-3 rounded-md skeleton-shimmer"
								style={{ width: `${w * 85}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (tabFiltered.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
				<MessageSquarePlus className="size-10 text-panel-muted/40" />
				<p className="text-sm text-panel-muted text-center">
					{searchQuery ? "Ничего не найдено" : "Пока нет чатов"}
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-0.5 overflow-y-auto px-2 py-1">
			{tabFiltered.map((chat) => (
				<ChatListItem
					key={chat.id}
					chat={chat}
					isActive={chat.id === activeChatId}
					currentUserId={userId}
					onSelect={setActiveChat}
				/>
			))}
		</div>
	);
});
