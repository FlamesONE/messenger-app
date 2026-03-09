import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { chatKeys, sortChatsByLastActivity } from "@/entities/chat";
import type { Chat } from "@/entities/chat";
import { useAuthStore } from "@/entities/user";
import { api } from "@/shared/api";
import type { Message, SendMessagePayload } from "../model/types";
import { messageKeys } from "./queries";

let optimisticCounter = 0;

export function useSendMessage() {
	const qc = useQueryClient();
	const userId = useAuthStore((s) => s.user?.id);

	return useMutation({
		mutationFn: async (data: SendMessagePayload) => {
			const { data: res, error } = await api.messages.post(data);
			if (error) throw error;
			return res as Message;
		},
		onMutate: async (variables) => {
			const key = messageKeys.byChat(variables.chatId);
			await qc.cancelQueries({ queryKey: key });

			const previous = qc.getQueryData<InfiniteData<Message[]>>(key);

			const optimisticMsg: Message = {
				id: `__optimistic_${++optimisticCounter}`,
				chatId: variables.chatId,
				senderId: userId || "",
				content: variables.content,
				media: [],
				reactions: [],
				readBy: [],
				replyTo: variables.replyTo ?? null,
				editedAt: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
				_optimistic: true,
				_failedPayload: variables,
			};

			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				const firstPage = old.pages[0] || [];
				return {
					...old,
					pages: [[optimisticMsg, ...firstPage], ...old.pages.slice(1)],
				};
			});

			qc.setQueryData<Chat[]>(chatKeys.all, (old) => {
				if (!old) return old;
				return sortChatsByLastActivity(
					old.map((c) =>
						c.id === variables.chatId
							? {
									...c,
									lastMessage: {
										content: variables.content,
										senderId: userId || "",
										createdAt: optimisticMsg.createdAt,
									},
									updatedAt: optimisticMsg.createdAt,
								}
							: c,
					),
				);
			});

			return { previous, optimisticId: optimisticMsg.id };
		},
		onSuccess: (msg, _variables, context) => {
			const key = messageKeys.byChat(msg.chatId);
			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) =>
						page.map((m) =>
							m.id === context?.optimisticId
								? { ...m, ...msg, _optimistic: undefined, _failed: undefined, _failedPayload: undefined }
								: m,
						),
					),
				};
			});

			qc.setQueryData<Chat[]>(chatKeys.all, (old) => {
				if (!old) return old;
				return sortChatsByLastActivity(
					old.map((c) =>
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
					),
				);
			});
		},
		onError: (_err, variables, context) => {
			const key = messageKeys.byChat(variables.chatId);
			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return context?.previous || old;
				return {
					...old,
					pages: old.pages.map((page) =>
						page.map((m) =>
							m.id === context?.optimisticId
								? { ...m, _failed: true, _failedPayload: variables }
								: m,
						),
					),
				};
			});
		},
	});
}

export function useRetryMessage() {
	const qc = useQueryClient();
	const sendMessage = useSendMessage();

	return useCallback(
		(message: Message) => {
			if (!message._failedPayload) return;
			const payload = message._failedPayload;

			const key = messageKeys.byChat(message.chatId);
			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => page.filter((m) => m.id !== message.id)),
				};
			});

			sendMessage.mutate(payload);
		},
		[qc, sendMessage],
	);
}

export function useRemoveFailedMessage() {
	const qc = useQueryClient();

	return useCallback(
		(message: Message) => {
			const key = messageKeys.byChat(message.chatId);
			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => page.filter((m) => m.id !== message.id)),
				};
			});
		},
		[qc],
	);
}

export function useToggleReaction() {
	const qc = useQueryClient();
	const userId = useAuthStore((s) => s.user?.id);

	return useMutation({
		mutationFn: async ({ chatId, messageId, emoji }: { chatId: string; messageId: string; emoji: string }) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { data, error } = await (api.messages as any)[chatId][messageId].reactions.post({ emoji });
			if (error) throw error;
			return { chatId, messageId, emoji, action: (data as { action: string }).action };
		},
		onMutate: async ({ chatId, messageId, emoji }) => {
			const key = messageKeys.byChat(chatId);
			await qc.cancelQueries({ queryKey: key });

			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) =>
						page.map((m) => {
							if (m.id !== messageId) return m;
							const reactions = m.reactions ?? [];
							const existing = reactions.find((r) => r.emoji === emoji && r.userId === userId);
							return {
								...m,
								reactions: existing
									? reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
									: [...reactions, { emoji, userId: userId || "" }],
							};
						}),
					),
				};
			});
		},
		onError: (_err, { chatId, messageId, emoji }) => {
			// Revert optimistic update on error
			qc.setQueryData<InfiniteData<Message[]>>(messageKeys.byChat(chatId), (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) =>
						page.map((m) => {
							if (m.id !== messageId) return m;
							const reactions = m.reactions ?? [];
							const existing = reactions.find((r) => r.emoji === emoji && r.userId === userId);
							return {
								...m,
								reactions: existing
									? reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
									: [...reactions, { emoji, userId: userId || "" }],
							};
						}),
					),
				};
			});
		},
	});
}

export function useEditMessage() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ chatId, messageId, content }: { chatId: string; messageId: string; content: string }) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { data, error } = await (api.messages as any)[chatId][messageId].patch({ content });
			if (error) throw error;
			return data as Message;
		},
		onMutate: async ({ chatId, messageId, content }) => {
			const key = messageKeys.byChat(chatId);
			await qc.cancelQueries({ queryKey: key });

			const previous = qc.getQueryData<InfiniteData<Message[]>>(key);

			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) =>
						page.map((m) =>
							m.id === messageId
								? { ...m, content, editedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
								: m,
						),
					),
				};
			});

			return { previous };
		},
		onError: (_err, { chatId }, context) => {
			if (context?.previous) {
				qc.setQueryData(messageKeys.byChat(chatId), context.previous);
			}
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
		onMutate: async ({ chatId, messageId }) => {
			const key = messageKeys.byChat(chatId);
			await qc.cancelQueries({ queryKey: key });

			const previous = qc.getQueryData<InfiniteData<Message[]>>(key);

			// Optimistic remove
			qc.setQueryData<InfiniteData<Message[]>>(key, (old) => {
				if (!old) return old;
				return {
					...old,
					pages: old.pages.map((page) => page.filter((m) => m.id !== messageId)),
				};
			});

			return { previous };
		},
		onError: (_err, { chatId }, context) => {
			if (context?.previous) {
				qc.setQueryData(messageKeys.byChat(chatId), context.previous);
			}
		},
	});
}
