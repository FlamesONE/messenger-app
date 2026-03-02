import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

export class DeleteMessageUseCase {
	constructor(private readonly messageRepo: IMessageRepository) {}

	async execute(userId: string, chatId: string, messageId: string) {
		const message = await this.messageRepo.findById(chatId, messageId);
		if (!message) {
			throw new NotFoundError("Message", messageId);
		}

		if (message.senderId !== userId) {
			throw new ForbiddenError("You can only delete your own messages");
		}

		await this.messageRepo.delete(chatId, messageId);
	}
}
