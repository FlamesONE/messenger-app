import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

export class DeleteChatUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(userId: string, chatId: string): Promise<void> {
		const chat = await this.chatRepo.findById(chatId);
		if (!chat) throw new NotFoundError("Chat not found");

		if (chat.isGroup) {
			throw new ForbiddenError("Cannot delete a group chat. Use leave instead.");
		}

		const isMember = await this.chatRepo.isMember(chatId, userId);
		if (!isMember) throw new ForbiddenError("You are not a member of this chat");

		await this.chatRepo.deleteChat(chatId);
	}
}
