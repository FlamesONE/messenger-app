import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { chatKeys } from "@/entities/chat";
import type { Chat } from "@/entities/chat";

export function useActiveChat(chatId: string | null): Chat | undefined {
	const qc = useQueryClient();
	const chats = qc.getQueryData<Chat[]>(chatKeys.all);
	return useMemo(() => chats?.find((c) => c.id === chatId), [chats, chatId]);
}
