import { useCallback } from "react";
import type { User } from "@/entities/user";
import type { Chat } from "./types";
import { useChatStore } from "./store";

/**
 * Returns a callback that navigates to an existing DM or creates a pending one.
 * Pass the current chats array so it can look up existing conversations.
 */
export function useStartDm(chats: Chat[]) {
	const setActiveChat = useChatStore((s) => s.setActiveChat);

	return useCallback(
		(targetUser: User) => {
			const existing = chats.find(
				(c) => !c.isGroup && c.dmUser?.id === targetUser.id,
			);
			if (existing) {
				setActiveChat(existing.id);
			} else {
				useChatStore.getState().setPendingDmUser(targetUser);
			}
		},
		[chats, setActiveChat],
	);
}
