import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/entities/chat/api/queries";
import type { Chat } from "@/entities/chat/model/types";
import { api } from "@/shared/api";
import type { Message } from "../model/types";
import { messageKeys } from "./queries";

export function useSendMessage() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (data: { chatId: string; content: string; mediaKeys?: string[] }) => {
			const { data: res, error } = await api.messages.post(data);
			if (error) throw error;
			return res as Message;
		},
		onSuccess: (msg) => {
			qc.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(msg.chatId), (old) => {
				if (!old) return old;
				const firstPage = old.pages[0] || [];
				if (firstPage.some((m) => m.id === msg.id)) return old;
				return {
					...old,
					pages: [[msg, ...firstPage], ...old.pages.slice(1)],
				};
			});

			qc.setQueryData<Chat[]>(chatKeys.all, (old) => {
				if (!old) return old;
				return old
					.map((c) =>
						c.id === msg.chatId
							? {
									...c,
									lastMessage: {
										content: msg.content,
										senderId: msg.senderId,
										createdAt: msg.createdAt,
									},
									updatedAt: msg.createdAt,
								}
							: c,
					)
					.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
			});
		},
	});
}

export function useDeleteMessage() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ chatId, messageId }: { chatId: string; messageId: string }) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			await (api.messages as any)[chatId][messageId].delete();
			return { chatId, messageId };
		},
		onSuccess: ({ chatId, messageId }) => {
			qc.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(chatId), (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => page.filter((m) => m.id !== messageId)),
				};
			});
		},
	});
}
