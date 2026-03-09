import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Chat, ChatMember } from "../model/types";

export const chatKeys = {
	all: ["chats"] as const,
	members: (chatId: string) => ["chats", chatId, "members"] as const,
};

function chatSortTime(c: Chat): number {
	return new Date(c.lastMessage?.createdAt ?? c.updatedAt).getTime();
}

export function sortChatsByLastActivity(chats: Chat[]): Chat[] {
	return chats.sort((a, b) => chatSortTime(b) - chatSortTime(a));
}

export function useChats() {
	return useQuery({
		queryKey: chatKeys.all,
		queryFn: async () => {
			const { data, error } = await api.chats.get();
			if (error) throw error;
			return sortChatsByLastActivity(data as Chat[]);
		},
	});
}

export function useChatMembers(chatId: string | null) {
	return useQuery({
		queryKey: chatKeys.members(chatId || ""),
		queryFn: async () => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { data, error } = await (api.chats as any)[chatId!].members.get();
			if (error) throw error;
			return data as ChatMember[];
		},
		enabled: !!chatId,
		staleTime: 60_000,
	});
}
