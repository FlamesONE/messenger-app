import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

export class AddMemberUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(requesterId: string, chatId: string, userId: string) {
		const chat = await this.chatRepo.findById(chatId);
		if (!chat) {
			throw new NotFoundError("Chat", chatId);
		}

		const isRequesterMember = await this.chatRepo.isMember(chatId, requesterId);
		if (!isRequesterMember) {
			throw new ForbiddenError("You are not a member of this chat");
		}

		await this.chatRepo.addMember(chatId, userId);
	}
}
