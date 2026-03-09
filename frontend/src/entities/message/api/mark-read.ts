import { api } from "@/shared/api";

export async function markMessageRead(chatId: string, messageId: string): Promise<void> {
	// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
	await (api.messages as any)[chatId][messageId].read.post();
}

export async function markMessagesReadBatch(chatId: string, messageIds: string[]): Promise<void> {
	if (messageIds.length === 0) return;
	// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
	await (api.messages as any)[chatId]["read-batch"].post({ messageIds });
}
