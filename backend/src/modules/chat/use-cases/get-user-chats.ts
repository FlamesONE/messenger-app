import type { IChatRepository } from "@/repositories/interfaces/chat.repository";

export class GetUserChatsUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(userId: string) {
		return this.chatRepo.findByUserId(userId);
	}
}
