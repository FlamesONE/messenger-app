import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Chat } from "../model/types";
import { chatKeys } from "./queries";

interface CreateChatPayload {
	name?: string;
	isGroup: boolean;
	memberIds: string[];
}

export function useCreateChat() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateChatPayload) => {
			const { data: res, error } = await api.chats.post(data);
			if (error) throw error;
			return res as Chat;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: chatKeys.all });
		},
	});
}

export function useAddMember(chatId: string, onSuccess?: () => void) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (data: { userId: string }) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { error } = await (api.chats as any)[chatId].members.post(data);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: chatKeys.all });
			onSuccess?.();
		},
	});
}

export function useGenerateInviteLink(chatId: string) {
	return useMutation({
		mutationFn: async () => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { data, error } = await (api.chats as any)[chatId].invite.post();
			if (error) throw error;
			return data as { inviteCode: string };
		},
	});
}

export function useJoinByInvite() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (inviteCode: string) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { data, error } = await (api.chats as any).join[inviteCode].post();
			if (error) throw error;
			return data as Chat;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: chatKeys.all });
		},
	});
}

export function useLeaveChat() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (chatId: string) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { error } = await (api.chats as any)[chatId].leave.delete();
			if (error) throw error;
			return chatId;
		},
		onSuccess: (chatId) => {
			qc.setQueryData<Chat[]>(chatKeys.all, (old) => {
				if (!old) return old;
				return old.filter((c) => c.id !== chatId);
			});
		},
	});
}

export function useDeleteChat() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (chatId: string) => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { error } = await (api.chats as any)[chatId].delete();
			if (error) throw error;
			return chatId;
		},
		onSuccess: (chatId) => {
			qc.setQueryData<Chat[]>(chatKeys.all, (old) => {
				if (!old) return old;
				return old.filter((c) => c.id !== chatId);
			});
		},
	});
}
