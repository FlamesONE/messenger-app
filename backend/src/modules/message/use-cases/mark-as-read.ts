import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import { ForbiddenError } from "@/shared/errors";

export class MarkAsReadUseCase {
	constructor(
		private readonly messageRepo: IMessageRepository,
		private readonly chatRepo: IChatRepository,
	) {}

	async execute(userId: string, chatId: string, messageId: string) {
		const isMember = await this.chatRepo.isMember(chatId, userId);
		if (!isMember) {
			throw new ForbiddenError("You are not a member of this chat");
		}

		await this.messageRepo.markAsRead(chatId, messageId, userId);
	}

	async executeBatch(userId: string, chatId: string, messageIds: string[]) {
		if (messageIds.length === 0) return;

		const isMember = await this.chatRepo.isMember(chatId, userId);
		if (!isMember) {
			throw new ForbiddenError("You are not a member of this chat");
		}

		await this.messageRepo.markAsReadBatch(chatId, messageIds, userId);
	}
}
