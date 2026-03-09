import {
	AlertCircle,
	Check,
	CheckCheck,
	Clock,
	Copy,
	Eye,
	Link,
	Pencil,
	Pin,
	RefreshCw,
	Reply,
	Smile,
	Trash2,
	X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showSuccess, showError, showInfo } from "@/shared/ui/custom-toast";
import { useTheme } from "next-themes";
import { useDeleteMessage, useRemoveFailedMessage, useRetryMessage, useToggleReaction } from "@/entities/message";
import type { Message } from "@/entities/message";
import type { ChatMember } from "@/entities/chat";
import { formatMessageTime } from "@/shared/lib/format-date";
import { useMessageActionStore } from "@/features/send-message/model/message-action-store";
import { cn } from "@/shared/lib/utils";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/shared/ui/components/ui/context-menu";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Tip } from "@/shared/ui/tip";
import { EmojiPickerOverlay } from "./EmojiPickerOverlay";
import { MediaGrid } from "./MediaGrid";
import { viewersLabel } from "../lib/viewers-label";

const QUICK_EMOJIS = ["❤️", "👍", "🔥", "😂", "😮", "👎"];
const MAX_UNIQUE_REACTIONS = 20;

interface MessageBubbleProps {
	message: Message;
	isMine: boolean;
	showTail: boolean;
	userId?: string;
	senderName?: string;
	senderAvatar?: string | null;
	members?: ChatMember[];
	allMessages?: Message[];
	onScrollToMessage?: (messageId: string) => void;
	onAvatarClick?: (senderId: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
	message,
	isMine,
	showTail,
	userId,
	senderName,
	senderAvatar,
	members,
	allMessages,
	onScrollToMessage,
	onAvatarClick,
}: MessageBubbleProps) {
	const deleteMessage = useDeleteMessage();
	const retryMessage = useRetryMessage();
	const removeFailedMessage = useRemoveFailedMessage();
	const toggleReaction = useToggleReaction();
	const setReply = useMessageActionStore((s) => s.setReply);
	const setEdit = useMessageActionStore((s) => s.setEdit);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [contextOpen, setContextOpen] = useState(false);
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
	const contextEventRef = useRef<{ x: number; y: number } | null>(null);
	const bubbleRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	const { resolvedTheme } = useTheme();

	const membersMap = useMemo(() => {
		const map = new Map<string, ChatMember>();
		if (members) for (const m of members) map.set(m.id, m);
		return map;
	}, [members]);

	const repliedMessage = useMemo(() => {
		if (!message.replyTo || !allMessages) return null;
		return allMessages.find((m) => m.id === message.replyTo) ?? null;
	}, [message.replyTo, allMessages]);

	const repliedSenderName = useMemo(() => {
		if (!repliedMessage) return null;
		if (repliedMessage.senderId === userId) return "Вы";
		return membersMap.get(repliedMessage.senderId)?.displayName ?? null;
	}, [repliedMessage, userId, membersMap]);

	useEffect(() => {
		const el = bubbleRef.current;
		if (!el) return;
		const handler = (e: MouseEvent) => {
			contextEventRef.current = { x: e.clientX, y: e.clientY };
		};
		el.addEventListener("contextmenu", handler);
		return () => el.removeEventListener("contextmenu", handler);
	}, []);

	useEffect(() => {
		if (!emojiPickerOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setEmojiPickerOpen(false);
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [emojiPickerOpen]);

	const handleDelete = useCallback(() => {
		setConfirmDelete(true);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		deleteMessage.mutate({ chatId: message.chatId, messageId: message.id });
		setConfirmDelete(false);
	}, [deleteMessage, message.chatId, message.id]);

	const handleCopy = useCallback(() => {
		if (message.content) {
			navigator.clipboard.writeText(message.content);
			showSuccess("Скопировано");
		}
	}, [message.content]);

	const handleCopyLink = useCallback(() => {
		showInfo("Ссылка на сообщение скопирована");
	}, []);

	const handleReply = useCallback(() => {
		const name = isMine ? "Вы" : (senderName || "Пользователь");
		setReply(message, name);
	}, [setReply, message, isMine, senderName]);

	const handleEdit = useCallback(() => {
		setEdit(message);
	}, [setEdit, message]);

	const handlePin = useCallback(() => {
		showInfo("Закрепление (скоро)");
	}, []);

	const handleRetry = useCallback(() => {
		retryMessage(message);
	}, [retryMessage, message]);

	const handleRemoveFailed = useCallback(() => {
		removeFailedMessage(message);
	}, [removeFailedMessage, message]);

	const handleQuickReaction = useCallback(
		(emoji: string) => {
			const reactions = message.reactions ?? [];
			const uniqueEmojis = new Set(reactions.map((r) => r.emoji));
			const alreadyReacted = reactions.some((r) => r.emoji === emoji && r.userId === userId);
			if (!alreadyReacted && uniqueEmojis.size >= MAX_UNIQUE_REACTIONS && !uniqueEmojis.has(emoji)) {
				showError(`Максимум ${MAX_UNIQUE_REACTIONS} разных реакций`);
				return;
			}
			toggleReaction.mutate({ chatId: message.chatId, messageId: message.id, emoji });
			setContextOpen(false);
		},
		[toggleReaction, message.chatId, message.id, message.reactions, userId],
	);

	const handleReactionSelect = useCallback(
		(emoji: { native: string }) => {
			const reactions = message.reactions ?? [];
			const uniqueEmojis = new Set(reactions.map((r) => r.emoji));
			const alreadyReacted = reactions.some((r) => r.emoji === emoji.native && r.userId === userId);
			if (!alreadyReacted && uniqueEmojis.size >= MAX_UNIQUE_REACTIONS && !uniqueEmojis.has(emoji.native)) {
				showError(`Максимум ${MAX_UNIQUE_REACTIONS} разных реакций`);
				return;
			}
			toggleReaction.mutate({ chatId: message.chatId, messageId: message.id, emoji: emoji.native });
			setEmojiPickerOpen(false);
		},
		[toggleReaction, message.chatId, message.id, message.reactions, userId],
	);

	const handleOpenFullPicker = useCallback(() => {
		setContextOpen(false);
		setTimeout(() => setEmojiPickerOpen(true), 100);
	}, []);

	if (message.deletedAt) {
		return (
			<div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
				<div className="rounded-2xl bg-bubble-in/50 px-3 py-1.5 text-xs italic text-muted-foreground animate-in fade-in duration-200">
					Сообщение удалено
				</div>
			</div>
		);
	}

	const hasMedia = message.media && message.media.length > 0;
	const hasText = !!message.content;
	const isOptimistic = message._optimistic;
	const isFailed = message._failed;
	const reactions = message.reactions ?? [];

	const groupedReactions = useMemo(
		() =>
			reactions.reduce<Map<string, string[]>>((map, r) => {
				const users = map.get(r.emoji) ?? [];
				users.push(r.userId);
				map.set(r.emoji, users);
				return map;
			}, new Map()),
		[reactions],
	);

	const hasReactions = groupedReactions.size > 0;

	const viewers = useMemo(
		() =>
			(message.readBy ?? [])
				.map((uid) => membersMap.get(uid))
				.filter((m): m is ChatMember => !!m && m.id !== message.senderId),
		[message.readBy, membersMap, message.senderId],
	);
	const isRead = viewers.length > 0;

	return (
		<>
			<ContextMenu open={contextOpen} onOpenChange={setContextOpen}>
				<ContextMenuTrigger asChild>
					<div
						ref={bubbleRef}
						className={cn(
							"group/msg relative animate-in fade-in slide-in-from-bottom-1 duration-200",
							isMine ? "flex justify-end" : "flex justify-start",
							!isMine && "pl-9",
							isFailed && "opacity-50",
						)}
					>
						{!isMine && (
							<div className="absolute left-0 bottom-0">
								{showTail ? (
									<button
										type="button"
										onClick={() => onAvatarClick?.(message.senderId)}
										className="transition-transform hover:scale-110 active:scale-95"
									>
										<ChatAvatar
											name={senderName || "?"}
											avatarUrl={senderAvatar}
											size="sm"
										/>
									</button>
								) : (
									<div className="size-7" />
								)}
							</div>
						)}

						<div className="flex flex-col max-w-[70%]">
							<div
								className={cn(
									"relative rounded-2xl transition-all px-3 py-1.5",
									isMine
										? "bg-primary text-primary-foreground"
										: "bg-bubble-in text-bubble-in-foreground border border-bubble-in-border",
									isMine && showTail && "rounded-br-sm",
									!isMine && showTail && "rounded-bl-sm",
								)}
							>
								{repliedMessage && (
									<button
										type="button"
										onClick={() => onScrollToMessage?.(repliedMessage.id)}
										className={cn(
											"flex w-full text-left gap-2 rounded-lg px-2 py-1 mb-1 -mx-0.5 cursor-pointer transition-colors",
											isMine
												? "bg-white/15 hover:bg-white/20"
												: "bg-foreground/[0.06] hover:bg-foreground/[0.1]",
										)}
										aria-label={`Ответ на сообщение от ${repliedSenderName ?? "пользователя"}`}
									>
										<div className={cn(
											"w-0.5 shrink-0 self-stretch rounded-full",
											isMine ? "bg-white/60" : "bg-primary",
										)} />
										<div className="min-w-0 flex-1 overflow-hidden">
											<span className={cn(
												"block text-[11px] font-semibold leading-tight truncate",
												isMine ? "text-white/80" : "text-primary",
											)}>
												{repliedSenderName ?? "Сообщение"}
											</span>
											<span className={cn(
												"block text-[12px] leading-tight truncate",
												isMine ? "text-white/60" : "text-foreground/60",
											)}>
												{repliedMessage.deletedAt
													? "Сообщение удалено"
													: repliedMessage.content || (repliedMessage.media?.length ? "Медиа" : "Сообщение")}
											</span>
										</div>
									</button>
								)}

								{hasMedia && (
									<div className={cn("overflow-hidden rounded-lg", !hasText && "-mx-3 -mt-1.5", hasText && "mb-1 -mx-1")}>
										<MediaGrid media={message.media} isMine={isMine} hasText={hasText} />
									</div>
								)}

								{hasText && (
									<p className="whitespace-pre-wrap break-words leading-[1.35] text-sm select-text">
										{message.content}
									</p>
								)}

								{hasReactions && (
									<div className="flex flex-wrap items-center gap-1 mt-1.5">
										{Array.from(groupedReactions.entries()).map(([emoji, userIds]) => {
											const isMeReacted = userId ? userIds.includes(userId) : false;
											const resolvedUsers = userIds
												.map((uid) => membersMap.get(uid))
												.filter(Boolean) as ChatMember[];
											const avatars = resolvedUsers.slice(0, 3);
											const names = resolvedUsers.map((u) => u.displayName);
											const tooltip = names.length > 0 ? names.join(", ") : undefined;

											return (
												<button
													key={emoji}
													type="button"
													onClick={() => handleQuickReaction(emoji)}
													title={tooltip}
													className={cn(
														"inline-flex items-center h-6 rounded-full px-1.5 gap-1 transition-colors",
														isMeReacted
															? isMine
																? "bg-white/25"
																: "bg-primary/20 ring-1 ring-inset ring-primary/25"
															: isMine
																? "bg-white/10 hover:bg-white/20"
																: "bg-foreground/[0.07] hover:bg-foreground/[0.12]",
													)}
												>
													<span className="text-[13px] leading-none">{emoji}</span>
													{userIds.length > 1 && (
														<span className={cn(
															"text-[10px] font-semibold tabular-nums leading-none",
															isMine ? "text-primary-foreground/70" : "text-foreground/60",
														)}>
															{userIds.length}
														</span>
													)}
													{avatars.length > 0 && (
														<span className="flex -space-x-1.5">
															{avatars.map((u) => (
																<span
																	key={u.id}
																	className={cn(
																		"inline-block size-4 rounded-full overflow-hidden ring-[1.5px]",
																		isMine ? "ring-primary" : "ring-bubble-in",
																	)}
																>
																	{u.avatarUrl ? (
																		<img src={u.avatarUrl} alt="" className="size-full object-cover" />
																	) : (
																		<span className="flex size-full items-center justify-center bg-muted text-[6px] font-bold text-muted-foreground">
																			{u.displayName[0]?.toUpperCase()}
																		</span>
																	)}
																</span>
															))}
														</span>
													)}
												</button>
											);
										})}
									</div>
								)}

								<div className={cn("flex items-center justify-end gap-0.5 mt-0.5")}>
									{message.editedAt && (
										<Tip label={`Изменено ${formatMessageTime(message.editedAt)}`}>
											<span
												className={cn("text-[10px] leading-none mr-0.5 cursor-default", isMine ? "text-primary-foreground/45" : "text-surface-muted/80")}
											>
												ред.
											</span>
										</Tip>
									)}
									<time className={cn("text-[10px] leading-none", isMine ? "text-primary-foreground/60" : "text-surface-muted")}>
										{formatMessageTime(message.createdAt)}
									</time>
									{isMine && (
										<>
											{isFailed ? (
												<Tip label="Ошибка отправки"><span><AlertCircle className="size-3.5 text-destructive" /></span></Tip>
											) : isOptimistic ? (
												<Tip label="Отправляется..."><span><Clock className="size-3 text-primary-foreground/50" /></span></Tip>
											) : (
												<Tip label={isRead ? "Прочитано" : "Доставлено"}>
													<span>
														{isRead
															? <CheckCheck className="size-3.5 text-sky-300" />
															: <Check className="size-3.5 text-primary-foreground/60" />
														}
													</span>
												</Tip>
											)}
										</>
									)}
								</div>

								{isFailed && (
									<button
										type="button"
										onClick={handleRetry}
										className="mt-1 flex items-center gap-1 text-[10px] text-destructive hover:underline"
									>
										<RefreshCw className="size-2.5" />
										Ошибка отправки — нажмите для повтора
									</button>
								)}
							</div>
						</div>
					</div>
				</ContextMenuTrigger>

				{!message.deletedAt && isFailed && (
					<ContextMenuContent className="min-w-52">
						<ContextMenuItem onSelect={handleRetry}>
							<RefreshCw className="size-4" />
							Отправить повторно
						</ContextMenuItem>
						{message.content && (
							<ContextMenuItem onSelect={handleCopy}>
								<Copy className="size-4" />
								Копировать текст
							</ContextMenuItem>
						)}
						<ContextMenuItem variant="destructive" onSelect={handleRemoveFailed}>
							<X className="size-4" />
							Убрать
						</ContextMenuItem>
					</ContextMenuContent>
				)}

				{!message.deletedAt && !isOptimistic && !isFailed && (
					<ContextMenuContent className="min-w-56 p-0">
						<div className="flex items-center gap-0.5 px-2 py-2 border-b border-border/50">
							{QUICK_EMOJIS.map((emoji) => {
								const isActive = userId
									? reactions.some((r) => r.emoji === emoji && r.userId === userId)
									: false;
								return (
									<button
										key={emoji}
										type="button"
										onClick={() => handleQuickReaction(emoji)}
										className={cn(
											"flex size-8 items-center justify-center rounded-lg text-lg transition-all hover:scale-110 hover:bg-accent",
											isActive && "bg-primary/15 ring-1 ring-primary/30",
										)}
									>
										{emoji}
									</button>
								);
							})}
							<button
								type="button"
								onClick={handleOpenFullPicker}
								className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:scale-110 hover:bg-accent hover:text-foreground"
								title="Все эмодзи"
							>
								<Smile className="size-4" />
							</button>
						</div>

						<div className="p-1">
							<ContextMenuItem onSelect={handleReply}>
								<Reply className="size-4" />
								Ответить
							</ContextMenuItem>
							{isMine && message.content && (
								<ContextMenuItem onSelect={handleEdit}>
									<Pencil className="size-4" />
									Редактировать
								</ContextMenuItem>
							)}
							<ContextMenuItem onSelect={handlePin}>
								<Pin className="size-4" />
								Закрепить
							</ContextMenuItem>
							{message.content && (
								<ContextMenuItem onSelect={handleCopy}>
									<Copy className="size-4" />
									Копировать текст
								</ContextMenuItem>
							)}
							<ContextMenuItem onSelect={handleCopyLink}>
								<Link className="size-4" />
								Копировать ссылку
							</ContextMenuItem>

							{isMine && viewers.length > 0 && (
								<>
									<ContextMenuSeparator />
									<ContextMenuSub>
										<ContextMenuSubTrigger>
											<Eye className="size-4" />
											<span className="flex-1">
												{viewers.length} {viewersLabel(viewers.length)}
											</span>
											<span className="flex -space-x-1.5 ml-2">
												{viewers.slice(0, 3).map((v) => (
													<span key={v.id} className="inline-block">
														<ChatAvatar
															name={v.displayName}
															avatarUrl={v.avatarUrl}
															size="sm"
														/>
													</span>
												))}
											</span>
										</ContextMenuSubTrigger>
										<ContextMenuSubContent className="min-w-48 p-1">
											{viewers.map((v) => (
												<div
													key={v.id}
													className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm"
												>
													<ChatAvatar
														name={v.displayName}
														avatarUrl={v.avatarUrl}
														size="sm"
													/>
													<span className="truncate">{v.displayName}</span>
												</div>
											))}
										</ContextMenuSubContent>
									</ContextMenuSub>
								</>
							)}

							{isMine && (
								<>
									<ContextMenuSeparator />
									<ContextMenuItem variant="destructive" onSelect={handleDelete}>
										<Trash2 className="size-4" />
										Удалить
									</ContextMenuItem>
								</>
							)}
						</div>
					</ContextMenuContent>
				)}
			</ContextMenu>

			{emojiPickerOpen &&
				createPortal(
					<EmojiPickerOverlay
						ref={pickerRef}
						anchorPos={contextEventRef.current}
						isMine={isMine}
						theme={resolvedTheme === "dark" ? "dark" : "light"}
						onSelect={handleReactionSelect}
						onClose={() => setEmojiPickerOpen(false)}
					/>,
					document.body,
				)}

			<ConfirmDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				title="Удалить сообщение?"
				description="Сообщение будет удалено без возможности восстановления."
				confirmLabel="Удалить"
				variant="destructive"
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
});
