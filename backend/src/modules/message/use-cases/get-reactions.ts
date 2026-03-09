import type { IMessageRepository, ReactionRecord } from "@/repositories/interfaces/message.repository";

export class GetReactionsUseCase {
	constructor(private readonly messageRepo: IMessageRepository) {}

	async execute(chatId: string, messageId: string): Promise<ReactionRecord[]> {
		return this.messageRepo.getReactions(chatId, messageId);
	}

	async executeBatch(chatId: string, messageIds: string[]): Promise<Map<string, ReactionRecord[]>> {
		return this.messageRepo.getReactionsBatch(chatId, messageIds);
	}
}
