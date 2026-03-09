import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/shared/errors";

export class EditMessageUseCase {
	constructor(
		private readonly messageRepo: IMessageRepository,
		private readonly chatRepo: IChatRepository,
	) {}

	async execute(userId: string, chatId: string, messageId: string, content: string) {
		if (!content.trim()) {
			throw new BadRequestError("Message content cannot be empty");
		}

		const isMember = await this.chatRepo.isMember(chatId, userId);
		if (!isMember) {
			throw new ForbiddenError("You are not a member of this chat");
		}

		const existing = await this.messageRepo.findById(chatId, messageId);
		if (!existing) {
			throw new NotFoundError("Message", messageId);
		}
		if (existing.senderId !== userId) {
			throw new ForbiddenError("You can only edit your own messages");
		}
		if (existing.deletedAt) {
			throw new BadRequestError("Cannot edit a deleted message");
		}

		const updated = await this.messageRepo.update(chatId, messageId, content.trim());
		if (!updated) {
			throw new NotFoundError("Message", messageId);
		}
		return updated;
	}
}
