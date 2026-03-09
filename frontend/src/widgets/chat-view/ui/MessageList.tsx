import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, forwardRef } from "react";
import type { ChatMember } from "@/entities/chat";
import type { Message } from "@/entities/message";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { ScrollToBottom } from "./ScrollToBottom";

export interface MessageListHandle {
	scrollToMessage: (messageId: string) => void;
}

interface MessageListProps {
	messages: Message[];
	userId: string | undefined;
	activeChatId: string | null;
	isLoading: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	members?: ChatMember[];
	highlightMessageId?: string | null;
	onAvatarClick?: (senderId: string) => void;
}

export const MessageList = memo(forwardRef<MessageListHandle, MessageListProps>(function MessageList({
	messages,
	userId,
	activeChatId: _activeChatId,
	isLoading,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	members,
	highlightMessageId,
	onAvatarClick,
}, ref) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [showScrollBtn, setShowScrollBtn] = useState(false);
	const [containerHeight, setContainerHeight] = useState(0);

	// Scroll tracking refs
	const isAtBottomRef = useRef(true);
	const hasUserScrolledRef = useRef(false);
	const isProgrammaticScrollRef = useRef(false);
	const prevFirstMsgIdRef = useRef<string | undefined>(undefined);
	const prevScrollHeightRef = useRef(0);
	const prevLengthRef = useRef(messages.length);

	useEffect(() => {
		const el = parentRef.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			if (entries[0]) setContainerHeight(entries[0].contentRect.height);
		});
		ro.observe(el);
		setContainerHeight(el.clientHeight);
		return () => ro.disconnect();
	}, []);

	const membersMap = useMemo(() => {
		if (!members) return null;
		const map = new Map<string, ChatMember>();
		for (const m of members) map.set(m.id, m);
		return map;
	}, [members]);

	const getItemKey = useCallback(
		(index: number) => messages[index]?.id ?? index,
		[messages],
	);

	const virtualizer = useVirtualizer({
		count: messages.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 64,
		overscan: 15,
		getItemKey,
	});

	// Stable scroll adjustment when measured sizes differ from estimates
	virtualizer.shouldAdjustScrollPositionOnItemSizeChange = (
		item,
		_delta,
		instance,
	) => item.start < (instance.scrollOffset ?? 0);

	// --- Helpers ---
	const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
		const el = parentRef.current;
		if (!el) return;
		isProgrammaticScrollRef.current = true;
		el.scrollTo({ top: el.scrollHeight, behavior });
		requestAnimationFrame(() => {
			isProgrammaticScrollRef.current = false;
		});
	}, []);

	const isNearBottom = useCallback((threshold = 150) => {
		const el = parentRef.current;
		if (!el) return true;
		return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
	}, []);

	// --- 1) Initial scroll to bottom ---
	// Re-fire on every totalSize change (virtualizer re-measures items) until user scrolls
	const totalSize = virtualizer.getTotalSize();
	useEffect(() => {
		if (hasUserScrolledRef.current || messages.length === 0) return;
		scrollToBottom("instant");
	}, [totalSize, scrollToBottom, messages.length]);

	// --- 2) Prepend stability: preserve scroll position when older messages load ---
	const snapshotBeforeFetch = useCallback(() => {
		const el = parentRef.current;
		if (el) {
			prevScrollHeightRef.current = el.scrollHeight;
			prevFirstMsgIdRef.current = messages[0]?.id;
		}
	}, [messages]);

	useLayoutEffect(() => {
		if (
			prevFirstMsgIdRef.current &&
			messages[0]?.id !== prevFirstMsgIdRef.current
		) {
			requestAnimationFrame(() => {
				const el = parentRef.current;
				if (!el || !prevScrollHeightRef.current) return;
				const delta = el.scrollHeight - prevScrollHeightRef.current;
				if (delta > 0) {
					el.scrollTop += delta;
				}
			});
		}
		prevFirstMsgIdRef.current = messages[0]?.id;
	}, [messages]);

	// --- 3) Auto-scroll when new messages arrive at the bottom ---
	useEffect(() => {
		if (messages.length > prevLengthRef.current && prevLengthRef.current > 0) {
			const lastMsg = messages[messages.length - 1];
			if (isAtBottomRef.current || lastMsg?.senderId === userId) {
				requestAnimationFrame(() => scrollToBottom("smooth"));
			}
		}
		prevLengthRef.current = messages.length;
	}, [messages, scrollToBottom, userId]);

	// --- 4) Scroll event handler ---
	const handleScroll = useCallback(() => {
		const el = parentRef.current;
		if (!el) return;

		isAtBottomRef.current = isNearBottom(80);

		if (!isProgrammaticScrollRef.current) {
			hasUserScrolledRef.current = true;
		}

		if (el.scrollTop < 200 && !isFetchingNextPage && hasNextPage) {
			snapshotBeforeFetch();
			fetchNextPage();
		}

		const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		setShowScrollBtn(distFromBottom > 300);
	}, [isFetchingNextPage, hasNextPage, fetchNextPage, isNearBottom, snapshotBeforeFetch]);

	const handleScrollToBottom = useCallback(() => {
		scrollToBottom("smooth");
	}, [scrollToBottom]);

	const handleScrollToMessage = useCallback(
		(messageId: string) => {
			const idx = messages.findIndex((m) => m.id === messageId);
			if (idx >= 0) {
				virtualizer.scrollToIndex(idx, { align: "center", behavior: "smooth" });
			}
		},
		[messages, virtualizer],
	);

	useImperativeHandle(ref, () => ({
		scrollToMessage: handleScrollToMessage,
	}), [handleScrollToMessage]);

	const virtualItems = virtualizer.getVirtualItems();

	const totalHeight = virtualizer.getTotalSize();
	const topPadding = totalHeight < containerHeight ? containerHeight - totalHeight : 0;

	return (
		<div
			ref={parentRef}
			onScroll={handleScroll}
			className="relative flex-1 overflow-y-auto mb-2"
		>
			{isLoading && messages.length === 0 ? (
				<div className="flex flex-1 flex-col justify-end gap-2.5 p-4">
					{([
						{ align: "start" as const, w: "w-48", h: "h-10" },
						{ align: "start" as const, w: "w-64", h: "h-14" },
						{ align: "end" as const, w: "w-40", h: "h-10" },
						{ align: "end" as const, w: "w-56", h: "h-10" },
						{ align: "start" as const, w: "w-36", h: "h-10" },
						{ align: "end" as const, w: "w-72", h: "h-16" },
						{ align: "start" as const, w: "w-52", h: "h-10" },
					]).map((b, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
						<div key={i} className={cn("flex", b.align === "end" ? "justify-end" : "justify-start")}>
							<div
								className={cn(
									b.w, b.h, "rounded-2xl skeleton-shimmer",
									b.align === "end" ? "rounded-br-sm" : "rounded-bl-sm",
								)}
							/>
						</div>
					))}
				</div>
			) : (
				<>
					{hasNextPage && messages.length > 0 && (
						<div className="py-2">
							{isFetchingNextPage ? (
								<div className="flex flex-col gap-2 px-4">
									{Array.from({ length: 3 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: static shimmer
										<div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
											<div
												className={cn(
													"h-9 rounded-2xl shimmer",
													i % 2 === 0 ? "w-48" : "w-36",
												)}
											/>
										</div>
									))}
								</div>
							) : (
								<div className="flex justify-center">
									<Button
										variant="secondary"
										size="sm"
										onClick={() => fetchNextPage()}
										className="rounded-full bg-surface-elevated text-surface-muted hover:bg-surface-elevated/80 border border-surface-border"
									>
										Загрузить ранее
									</Button>
								</div>
							)}
						</div>
					)}

					<div
						style={{
							height: `${totalHeight + topPadding}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{virtualItems.map((virtualRow) => {
							const msg = messages[virtualRow.index];
							const isMine = msg.senderId === userId;
							const nextMsg = messages[virtualRow.index + 1];
							const showTail = !nextMsg || nextMsg.senderId !== msg.senderId;
							const sender = !isMine && membersMap ? membersMap.get(msg.senderId) : undefined;

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
										transform: `translateY(${virtualRow.start + topPadding}px)`,
									}}
									className="px-4 py-[2px]"
								>
									<div className={cn(
									highlightMessageId === msg.id && "ring-2 ring-primary/50 rounded-2xl transition-all duration-500",
								)}>
									<MessageBubble
										message={msg}
										isMine={isMine}
										showTail={showTail}
										userId={userId}
										senderName={sender?.displayName}
										senderAvatar={sender?.avatarUrl}
										members={members}
										allMessages={messages}
										onScrollToMessage={handleScrollToMessage}
										onAvatarClick={onAvatarClick}
									/>
								</div>
								</div>
							);
						})}
					</div>
				</>
			)}

			<ScrollToBottom visible={showScrollBtn} onClick={handleScrollToBottom} />
		</div>
	);
}));
