import type { IMessageRepository, ReactionRecord } from "@/repositories/interfaces/message.repository";

export class ToggleReactionUseCase {
	constructor(private readonly messageRepo: IMessageRepository) {}

	async execute(
		userId: string,
		chatId: string,
		messageId: string,
		emoji: string,
	): Promise<{ action: "added" | "removed"; reaction: ReactionRecord | null }> {
		const existing = await this.messageRepo.getReactions(chatId, messageId);
		const userReaction = existing.find((r) => r.userId === userId && r.emoji === emoji);

		if (userReaction) {
			await this.messageRepo.removeReaction(chatId, messageId, userId, emoji);
			return { action: "removed", reaction: null };
		}

		const reaction = await this.messageRepo.addReaction(chatId, messageId, userId, emoji);
		return { action: "added", reaction };
	}
}
