import { ArrowLeft, Check, Copy, Link, Loader2, LogOut, MoreVertical, Search, Trash2, UserPlus, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { showSuccess, showError } from "@/shared/ui/custom-toast";
import { useGenerateInviteLink, useLeaveChat, useDeleteChat, useChatStore } from "@/entities/chat";
import type { Chat } from "@/entities/chat";
import type { User } from "@/entities/user";
import { formatLastSeen } from "@/shared/lib/format-date";
import { usePresenceStore } from "@/entities/user";
import { useTypingUsers, useSearchMessages } from "@/entities/message";
import type { Message } from "@/entities/message";
import { useDebounce } from "@uidotdev/usehooks";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { Button } from "@/shared/ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/components/ui/dropdown-menu";
import { Input } from "@/shared/ui/components/ui/input";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Tip } from "@/shared/ui/tip";
import { AddMemberDialog } from "@/features/chat-list/AddMemberDialog";
import { SearchResultItem } from "./SearchResultItem";

interface ChatHeaderProps {
	chat: Chat | undefined;
	onBack?: () => void;
	otherUser?: User | null;
	memberCount?: number;
	onOpenProfile?: () => void;
	onScrollToMessage?: (messageId: string) => void;
}

export const ChatHeader = memo(function ChatHeader({ chat, onBack, otherUser, memberCount, onOpenProfile, onScrollToMessage }: ChatHeaderProps) {
	const [addMemberOpen, setAddMemberOpen] = useState(false);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [inviteLink, setInviteLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [confirmLeave, setConfirmLeave] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const generateInvite = useGenerateInviteLink(chat?.id ?? "");
	const leaveChat = useLeaveChat();
	const deleteChat = useDeleteChat();
	const setActiveChat = useChatStore((s) => s.setActiveChat);

	const debouncedSearch = useDebounce(searchQuery.trim(), 350);
	const { data: searchResults = [], isFetching: isSearching } = useSearchMessages(
		searchOpen ? (chat?.id ?? null) : null,
		debouncedSearch,
	);

	const typingUsers = useTypingUsers(chat?.id);
	const isOtherOnline = usePresenceStore((s) =>
		otherUser ? s.isOnline(otherUser.id) : false,
	);
	const lastSeenAt = usePresenceStore((s) =>
		otherUser ? s.lastSeen[otherUser.id] : undefined,
	);

	const subtitle = useMemo(() => {
		if (typingUsers.length > 0) {
			return typingUsers.length === 1 ? "печатает..." : "печатают...";
		}
		if (!chat) return "";
		if (chat.isGroup) {
			if (memberCount != null) {
				return `${memberCount} ${pluralMembers(memberCount)}`;
			}
			return "Группа";
		}
		if (isOtherOnline) return "В сети";
		if (lastSeenAt) return formatLastSeen(lastSeenAt);
		return "Не в сети";
	}, [typingUsers, chat, isOtherOnline, lastSeenAt, memberCount]);

	const handleCloseAddMember = useCallback(() => setAddMemberOpen(false), []);

	const handleClickProfile = useCallback(() => {
		onOpenProfile?.();
	}, [onOpenProfile]);

	const handleLeaveChat = useCallback(() => {
		setConfirmLeave(true);
	}, []);

	const handleConfirmLeave = useCallback(async () => {
		if (!chat) return;
		try {
			if (chat.isGroup) {
				await leaveChat.mutateAsync(chat.id);
				showSuccess("Вы покинули группу");
			} else {
				await deleteChat.mutateAsync(chat.id);
				showSuccess("Чат удалён");
			}
			setActiveChat(null);
		} catch {
			showError(chat.isGroup ? "Не удалось покинуть группу" : "Не удалось удалить чат");
		}
		setConfirmLeave(false);
	}, [chat, leaveChat, deleteChat, setActiveChat]);

	const handleOpenInviteDialog = useCallback(async () => {
		setInviteDialogOpen(true);
		setCopied(false);
		try {
			const result = await generateInvite.mutateAsync();
			const link = `${window.location.origin}/join/${result.inviteCode}`;
			setInviteLink(link);
		} catch {
			showError("Не удалось получить ссылку-приглашение");
			setInviteDialogOpen(false);
		}
	}, [generateInvite]);

	const handleCopyInviteLink = useCallback(async () => {
		if (!inviteLink) return;
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
		showSuccess("Ссылка скопирована");
		setTimeout(() => setCopied(false), 2000);
	}, [inviteLink]);

	const handleCloseInviteDialog = useCallback(() => {
		setInviteDialogOpen(false);
		setInviteLink(null);
	}, []);

	const handleToggleSearch = useCallback(() => {
		setSearchOpen((prev) => {
			if (prev) {
				setSearchQuery("");
			}
			return !prev;
		});
	}, []);

	useEffect(() => {
		if (searchOpen) {
			requestAnimationFrame(() => searchInputRef.current?.focus());
		}
	}, [searchOpen]);

	const handleSearchKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				handleToggleSearch();
			}
		},
		[handleToggleSearch],
	);

	const handleResultClick = useCallback(
		(msg: Message) => {
			onScrollToMessage?.(msg.id);
			setSearchOpen(false);
			setSearchQuery("");
		},
		[onScrollToMessage],
	);

	if (!chat) return null;

	const isLoading = !chat.isGroup && !otherUser && !chat.name;
	const chatName = chat.name || (chat.isGroup ? (chat.name || "Группа") : otherUser?.displayName);
	const isTyping = typingUsers.length > 0;
	const showResults = searchOpen && debouncedSearch.length >= 1;

	return (
		<>
			<div className="shrink-0 border-b border-surface-border mb-2 relative z-10">
				{/* Main bar */}
				<div className="flex h-14 items-center gap-3 px-5">
					{onBack && (
						<Tip label="Назад">
							<Button
								variant="ghost"
								size="icon"
								onClick={onBack}
								className="mr-1 rounded-full lg:hidden"
							>
								<ArrowLeft className="size-5" />
							</Button>
						</Tip>
					)}

					{searchOpen ? (
						<div className="flex flex-1 items-center gap-2 min-w-0">
							<Search className="size-4 shrink-0 text-muted-foreground" />
							<input
								ref={searchInputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={handleSearchKeyDown}
								placeholder="Поиск по сообщениям..."
								className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
							/>
							{isSearching && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
							{!isSearching && debouncedSearch && (
								<span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
									{searchResults.length} {searchResults.length === 1 ? "результат" : searchResults.length < 5 ? "результата" : "результатов"}
								</span>
							)}
							<Button variant="ghost" size="icon-xs" onClick={handleToggleSearch} className="shrink-0">
								<X className="size-4" />
							</Button>
						</div>
					) : (
						<>
							<button
								type="button"
								onClick={handleClickProfile}
								className="shrink-0 transition-transform active:scale-95"
							>
								{isLoading ? (
									<div className="size-10 rounded-full skeleton-shimmer" />
								) : (
									<ChatAvatar
										name={chatName || ""}
										avatarUrl={otherUser?.avatarUrl}
										size="default"
										online={!chat.isGroup && isOtherOnline}
									/>
								)}
							</button>

							<button
								type="button"
								onClick={handleClickProfile}
								className="flex-1 min-w-0 text-left"
							>
								{isLoading ? (
									<div className="space-y-2">
										<div className="h-4 w-28 rounded-md skeleton-shimmer" />
										<div className="h-3 w-16 rounded-md skeleton-shimmer" />
									</div>
								) : (
									<>
										<h2 className="truncate text-sm font-semibold leading-tight">{chatName}</h2>
										<p
											className={`text-xs transition-colors duration-200 ${
												isTyping ? "text-primary" : isOtherOnline ? "text-emerald-500" : "text-muted-foreground"
											}`}
										>
											{subtitle}
										</p>
									</>
								)}
							</button>

							<div className="flex items-center gap-0.5">
								<Tip label="Поиск">
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										onClick={handleToggleSearch}
									>
										<Search className="size-4.5" />
									</Button>
								</Tip>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="rounded-full" aria-label="Ещё">
										<MoreVertical className="size-4.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="min-w-[200px]">
									{chat.isGroup && (
										<>
											<DropdownMenuItem
												onSelect={(e) => {
													e.preventDefault();
													setAddMemberOpen(true);
												}}
											>
												<UserPlus className="size-4" />
												Добавить участника
											</DropdownMenuItem>
											<DropdownMenuItem
												onSelect={(e) => {
													e.preventDefault();
													handleOpenInviteDialog();
												}}
											>
												<Link className="size-4" />
												Ссылка-приглашение
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem variant="destructive" onSelect={handleLeaveChat}>
										{chat.isGroup ? (
											<><LogOut className="size-4" />Покинуть группу</>
										) : (
											<><Trash2 className="size-4" />Удалить чат</>
										)}
									</DropdownMenuItem>
								</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</>
					)}
				</div>

				{/* Search results dropdown */}
				{showResults && (
					<div className="absolute inset-x-0 top-full z-[100] max-h-[50vh] overflow-y-auto rounded-b-xl border-b border-x border-surface-border bg-background shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
						{searchResults.length === 0 && !isSearching && (
							<div className="px-4 py-6 text-center text-sm text-muted-foreground">
								Ничего не найдено
							</div>
						)}
						{searchResults.map((msg) => (
							<SearchResultItem
								key={msg.id}
								message={msg}
								query={debouncedSearch}
								onClick={handleResultClick}
							/>
						))}
					</div>
				)}
			</div>

			{chat.isGroup && (
				<AddMemberDialog chatId={chat.id} open={addMemberOpen} onClose={handleCloseAddMember} />
			)}

			<AppDrawer
				open={inviteDialogOpen}
				onOpenChange={(v) => !v && handleCloseInviteDialog()}
				title="Ссылка-приглашение"
				variant="surface"
			>
				{!inviteLink ? (
					<div className="flex items-center justify-center py-6">
						<Loader2 className="size-5 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-muted-foreground">
							Любой, у кого есть эта ссылка, сможет присоединиться к группе.
						</p>
						<div className="flex items-center gap-2">
							<Input value={inviteLink} readOnly className="text-xs" />
							<Tip label={copied ? "Скопировано" : "Копировать"}>
								<Button
									size="icon"
									variant="outline"
									onClick={handleCopyInviteLink}
									className="shrink-0"
								>
									{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
								</Button>
							</Tip>
						</div>
					</div>
				)}
			</AppDrawer>

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

function pluralMembers(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return "участник";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "участника";
	return "участников";
}

