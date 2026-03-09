import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Message } from "../model/types";

export const messageKeys = {
	byChat: (chatId: string) => ["messages", chatId] as const,
	search: (chatId: string, q: string) => ["messages", chatId, "search", q] as const,
};

async function fetchMessages(chatId: string, before?: string): Promise<Message[]> {
	const query: Record<string, unknown> = { limit: 50 };
	if (before) query.before = before;

	// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
	const { data, error } = await (api.messages as any)[chatId].get({ query });
	if (error) throw error;
	return data as Message[];
}

export function useMessages(chatId: string | null) {
	return useInfiniteQuery({
		queryKey: chatId ? messageKeys.byChat(chatId) : ["messages", null],
		queryFn: ({ pageParam }) => fetchMessages(chatId!, pageParam),
		getNextPageParam: (lastPage) =>
			lastPage.length === 50 ? lastPage[lastPage.length - 1]?.createdAt : undefined,
		enabled: !!chatId,
		initialPageParam: undefined as string | undefined,
	});
}

async function searchMessages(chatId: string, query: string): Promise<Message[]> {
	// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
	const { data, error } = await (api.messages as any)[chatId].search.get({
		query: { q: query, limit: 30 },
	});
	if (error) throw error;
	return data as Message[];
}

export function useSearchMessages(chatId: string | null, query: string) {
	return useQuery({
		queryKey: chatId ? messageKeys.search(chatId, query) : ["messages", null, "search"],
		queryFn: () => searchMessages(chatId!, query),
		enabled: !!chatId && query.trim().length >= 1,
		placeholderData: (prev) => prev,
		staleTime: 30_000,
	});
}
