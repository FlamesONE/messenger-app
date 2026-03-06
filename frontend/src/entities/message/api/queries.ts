import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Message } from "../model/types";

export const messageKeys = {
	byChat: (chatId: string) => ["messages", chatId] as const,
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
