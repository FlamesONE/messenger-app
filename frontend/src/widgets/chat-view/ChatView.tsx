import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChatStore, useChats } from "@/entities/chat";
import { useMessages } from "@/entities/message";
import { useAuthStore } from "@/entities/user";
import { MessageInput } from "@/features/send-message/MessageInput";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/components/ui/skeleton";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";

function EmptyState() {
	return (
		<div className="flex flex-1 items-center justify-center chat-bg-pattern">
			<div className="text-center">
				<MessageCircle className="mx-auto mb-3 size-12 text-muted-foreground/20" />
				<p className="text-sm text-muted-foreground">Выберите чат, чтобы начать общение</p>
			</div>
		</div>
	);
}

export function ChatView() {
	const activeChatId = useChatStore((s) => s.activeChatId);
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const { data: chats } = useChats();
	const chat = useMemo(() => chats?.find((c) => c.id === activeChatId), [chats, activeChatId]);

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMessages(activeChatId);
	const userId = useAuthStore((s) => s.user?.id);

	const parentRef = useRef<HTMLDivElement>(null);

	// Flatten pages: pages are newest-first, each page is newest-first
	// We need chronological order (oldest first) for display
	const messages = useMemo(() => {
		if (!data) return [];
		// pages[0] = newest, pages[n] = oldest
		// each page: newest message first
		// Flatten all, then reverse for chronological order
		return [...data.pages.flat()].reverse();
	}, [data]);

	const virtualizer = useVirtualizer({
		count: messages.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 52,
		overscan: 10,
	});

	// Auto-scroll to bottom on new messages
	const prevCountRef = useRef(0);
	useEffect(() => {
		if (messages.length > prevCountRef.current && messages.length > 0) {
			requestAnimationFrame(() => {
				virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
			});
		}
		prevCountRef.current = messages.length;
	}, [messages.length, virtualizer]);

	// Scroll to bottom on chat switch
	const prevChatIdRef = useRef<string | null>(null);
	useEffect(() => {
		if (activeChatId !== prevChatIdRef.current) {
			prevChatIdRef.current = activeChatId;
			if (messages.length > 0) {
				requestAnimationFrame(() => {
					virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
				});
			}
		}
	}, [activeChatId, messages.length, virtualizer]);

	const loadMore = useCallback(() => {
		if (!isFetchingNextPage && hasNextPage) {
			fetchNextPage();
		}
	}, [isFetchingNextPage, hasNextPage, fetchNextPage]);

	const handleScroll = useCallback(() => {
		const el = parentRef.current;
		if (!el) return;
		if (el.scrollTop < 80) {
			loadMore();
		}
	}, [loadMore]);

	if (!activeChatId) return <EmptyState />;

	return (
		<div className="flex flex-1 flex-col">
			<ChatHeader chat={chat} onBack={() => setActiveChat(null)} />

			{/* Messages area */}
			<div
				ref={parentRef}
				onScroll={handleScroll}
				className="relative flex-1 overflow-y-auto chat-bg-pattern"
			>
				{isLoading && messages.length === 0 ? (
					<div className="flex flex-col gap-2 p-4">
						{Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
							<div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
								<Skeleton className="h-9 w-44 rounded-2xl" />
							</div>
						))}
					</div>
				) : (
					<>
						{hasNextPage && messages.length > 0 && (
							<div className="flex justify-center py-3">
								<button
									type="button"
									onClick={loadMore}
									disabled={isFetchingNextPage}
									className="flex items-center gap-1.5 rounded-full bg-card/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur hover:bg-card transition-colors"
								>
									{isFetchingNextPage && <Loader2 className="size-3 animate-spin" />}
									{isFetchingNextPage ? "Загрузка..." : "Загрузить ранее"}
								</button>
							</div>
						)}

						<div
							style={{
								height: `${virtualizer.getTotalSize()}px`,
								width: "100%",
								position: "relative",
							}}
						>
							{virtualizer.getVirtualItems().map((virtualRow) => {
								const msg = messages[virtualRow.index];
								const isMine = msg.senderId === userId;
								const nextMsg = messages[virtualRow.index + 1];
								const showTail = !nextMsg || nextMsg.senderId !== msg.senderId;

								return (
									<div
										key={virtualRow.key}
										data-index={virtualRow.index}
										ref={virtualizer.measureElement}
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											transform: `translateY(${virtualRow.start}px)`,
										}}
										className="px-4 py-[2px]"
									>
										<MessageBubble message={msg} isMine={isMine} showTail={showTail} />
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>

			<MessageInput />
		</div>
	);
}
