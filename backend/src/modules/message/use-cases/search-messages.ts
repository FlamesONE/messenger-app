import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import { ForbiddenError } from "@/shared/errors";

export class SearchMessagesUseCase {
	constructor(
		private readonly messageRepo: IMessageRepository,
		private readonly chatRepo: IChatRepository,
	) {}

	async execute(userId: string, chatId: string, query: string, limit?: number, before?: Date) {
		const isMember = await this.chatRepo.isMember(chatId, userId);
		if (!isMember) throw new ForbiddenError("You are not a member of this chat");

		return this.messageRepo.searchMessages({ chatId, query, limit, before });
	}
}
