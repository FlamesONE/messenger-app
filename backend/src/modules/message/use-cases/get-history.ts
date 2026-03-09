import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IMessageRepository, MessageRecord, ReactionRecord } from "@/repositories/interfaces/message.repository";
import { ForbiddenError } from "@/shared/errors";

export interface MessageWithReactions extends MessageRecord {
	reactions: ReactionRecord[];
	readBy: string[];
}

export class GetHistoryUseCase {
	constructor(
		private readonly messageRepo: IMessageRepository,
		private readonly chatRepo: IChatRepository,
	) {}

	async execute(userId: string, chatId: string, limit?: number, before?: Date): Promise<MessageWithReactions[]> {
		const isMember = await this.chatRepo.isMember(chatId, userId);
		if (!isMember) {
			throw new ForbiddenError("You are not a member of this chat");
		}

		const messages = await this.messageRepo.getHistory({ chatId, limit, before });

		if (messages.length === 0) return [];

		const messageIds = messages.map((m) => m.id);
		const [reactionsMap, readersMap] = await Promise.all([
			this.messageRepo.getReactionsBatch(chatId, messageIds),
			this.messageRepo.getReadersBatch(chatId, messageIds),
		]);

		return messages.map((m) => ({
			...m,
			reactions: reactionsMap.get(m.id) ?? [],
			readBy: readersMap.get(m.id) ?? [],
		}));
	}
}
