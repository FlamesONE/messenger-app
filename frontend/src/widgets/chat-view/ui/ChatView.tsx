import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatMembers, useChatStore, useCreateChat } from "@/entities/chat";
import type { Chat } from "@/entities/chat";
import { markMessagesReadBatch, useMessages } from "@/entities/message";
import { useAuthStore } from "@/entities/user";
import type { User } from "@/entities/user";
import { MessageInput } from "@/features/send-message/ui/MessageInput";
import { GroupProfileDrawer } from "@/features/profile/GroupProfileDrawer";
import { UserProfileDialog } from "@/features/profile/UserProfileDialog";
import { useWs } from "@/features/ws";
import { ALLOWED_FILE_TYPES } from "@/shared/api/upload";
import { useUnreadStore } from "@/entities/message";
import { cn } from "@/shared/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { DropZoneOverlay } from "./DropZoneOverlay";
import { EmptyChat } from "./EmptyChat";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";
import type { MessageListHandle } from "./MessageList";
import { useActiveChat } from "../lib/use-active-chat";

export const ChatView = memo(function ChatView() {
	const activeChatId = useChatStore((s) => s.activeChatId);
	const pendingDmUser = useChatStore((s) => s.pendingDmUser);
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const setPendingDmUser = useChatStore((s) => s.setPendingDmUser);
	const chat = useActiveChat(activeChatId);
	const [isDragging, setIsDragging] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [avatarProfileUser, setAvatarProfileUser] = useState<User | null>(null);
	const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
	const messageListRef = useRef<MessageListHandle>(null);
	const createChat = useCreateChat();

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMessages(activeChatId);
	const userId = useAuthStore((s) => s.user?.id);
	const { joinChat } = useWs();
	const resetUnread = useUnreadStore((s) => s.reset);

	const { data: members } = useChatMembers(activeChatId);
	const otherUser = useMemo<User | null>(() => {
		if (pendingDmUser) return pendingDmUser;
		if (!members || !userId || chat?.isGroup) return null;
		const other = members.find((m) => m.id !== userId);
		if (!other) return null;
		return {
			id: other.id,
			username: other.username,
			displayName: other.displayName,
			avatarUrl: other.avatarUrl,
			email: "",
		};
	}, [members, userId, chat?.isGroup, pendingDmUser]);

	const handleCreatePendingChat = useCallback(async (): Promise<string | null> => {
		if (!pendingDmUser) return null;
		try {
			const newChat = await createChat.mutateAsync({
				isGroup: false,
				memberIds: [pendingDmUser.id],
			});
			setActiveChat(newChat.id);
			return newChat.id;
		} catch {
			return null;
		}
	}, [pendingDmUser, createChat, setActiveChat]);

	useEffect(() => {
		if (activeChatId) {
			joinChat(activeChatId);
			resetUnread(activeChatId);
		}
	}, [activeChatId, joinChat, resetUnread]);

	useEffect(() => {
		setProfileOpen(false);
	}, [activeChatId]);

	const messages = useMemo(() => {
		if (!data) return [];
		return [...data.pages.flat()].reverse();
	}, [data]);

	const unreadMessageIds = useMemo(() => {
		if (!userId) return [];
		return messages
			.filter((m) => m.senderId !== userId && !(m.readBy ?? []).includes(userId))
			.map((m) => m.id);
	}, [messages, userId]);

	const unreadKey = unreadMessageIds.join(",");

	useEffect(() => {
		if (!activeChatId || !userId || unreadMessageIds.length === 0) return;
		markMessagesReadBatch(activeChatId, unreadMessageIds).catch(() => {});
	}, [activeChatId, userId, unreadKey]);

	const handleBack = useCallback(() => {
		if (pendingDmUser) {
			setPendingDmUser(null);
		} else {
			setActiveChat(null);
		}
	}, [setActiveChat, setPendingDmUser, pendingDmUser]);

	const handleOpenProfile = useCallback(() => {
		setProfileOpen(true);
	}, []);
	const handleCloseProfile = useCallback(() => {
		setProfileOpen(false);
	}, []);

	const handleAvatarClick = useCallback((senderId: string) => {
		if (!members) return;
		const member = members.find((m) => m.id === senderId);
		if (!member) return;
		setAvatarProfileUser({
			id: member.id,
			username: member.username,
			displayName: member.displayName,
			avatarUrl: member.avatarUrl,
			email: "",
		});
	}, [members]);

	const handleCloseAvatarProfile = useCallback(() => {
		setAvatarProfileUser(null);
	}, []);

	const handleScrollToMessage = useCallback((messageId: string) => {
		messageListRef.current?.scrollToMessage(messageId);
		setHighlightMessageId(messageId);
		setTimeout(() => setHighlightMessageId(null), 2000);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.types.includes("Files")) {
			setIsDragging(true);
		}
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		if (
			e.clientX <= rect.left ||
			e.clientX >= rect.right ||
			e.clientY <= rect.top ||
			e.clientY >= rect.bottom
		) {
			setIsDragging(false);
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			const validFiles = Array.from(files).filter((f) =>
				ALLOWED_FILE_TYPES.includes(f.type),
			);
			if (validFiles.length > 0) {
				const event = new CustomEvent("chat-drop-files", {
					detail: { files: validFiles },
				});
				window.dispatchEvent(event);
			}
		}
	}, []);

	const isPending = !!pendingDmUser && !activeChatId;

	if (!activeChatId && !pendingDmUser) {
		return (
			<div className={cn("flex-1", "max-lg:hidden")}>
				<EmptyState />
			</div>
		);
	}

	const pendingChat: Chat | undefined = isPending
		? {
				id: "__pending__",
				name: null,
				isGroup: false,
				createdById: userId || "",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				dmUser: pendingDmUser
					? {
							id: pendingDmUser.id,
							username: pendingDmUser.username,
							displayName: pendingDmUser.displayName,
							avatarUrl: pendingDmUser.avatarUrl ?? null,
						}
					: undefined,
			}
		: undefined;

	const displayChat = chat || pendingChat;

	return (
		<>
			<div
				className={cn(
					"chat-surface relative flex flex-1 flex-col min-w-0",
					"max-lg:absolute max-lg:inset-0 max-lg:z-20",
				)}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<ChatHeader
					chat={displayChat}
					onBack={handleBack}
					otherUser={otherUser}
					memberCount={members?.length}
					onOpenProfile={handleOpenProfile}
					onScrollToMessage={handleScrollToMessage}
				/>

				{!isLoading && messages.length === 0 ? (
					<EmptyChat
						chatName={displayChat?.name || otherUser?.displayName || "Чат"}
						avatarUrl={otherUser?.avatarUrl || displayChat?.dmUser?.avatarUrl}
						isGroup={displayChat?.isGroup}
					/>
				) : (
					<MessageList
						ref={messageListRef}
						key={activeChatId || "__pending__"}
						messages={messages}
						userId={userId}
						activeChatId={activeChatId || "__pending__"}
						isLoading={isLoading}
						hasNextPage={!!hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						fetchNextPage={fetchNextPage}
						members={members}
						highlightMessageId={highlightMessageId}
						onAvatarClick={handleAvatarClick}
					/>
				)}

				<MessageInput onCreatePendingChat={isPending ? handleCreatePendingChat : undefined} messages={messages} userId={userId} />
				<DropZoneOverlay active={isDragging} />
			</div>

			{displayChat?.isGroup ? (
				<GroupProfileDrawer chat={displayChat} open={profileOpen} onClose={handleCloseProfile} />
			) : (
				otherUser && <UserProfileDialog user={otherUser} open={profileOpen} onClose={handleCloseProfile} />
			)}

			<UserProfileDialog user={avatarProfileUser} open={!!avatarProfileUser} onClose={handleCloseAvatarProfile} />
		</>
	);
});
