import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Chat } from "../model/types";

export const chatKeys = {
	all: ["chats"] as const,
};

export function useChats() {
	return useQuery({
		queryKey: chatKeys.all,
		queryFn: async () => {
			const { data, error } = await api.chats.get();
			if (error) throw error;
			return (data as Chat[]).sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			);
		},
	});
}
