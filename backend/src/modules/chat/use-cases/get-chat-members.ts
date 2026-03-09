import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { ForbiddenError } from "@/shared/errors";

export class GetChatMembersUseCase {
	constructor(
		private readonly chatRepo: IChatRepository,
		private readonly userRepo: IUserRepository,
	) {}

	async execute(requesterId: string, chatId: string) {
		const isMember = await this.chatRepo.isMember(chatId, requesterId);
		if (!isMember) {
			throw new ForbiddenError("Not a member of this chat");
		}

		const members = await this.chatRepo.getMembers(chatId);
		const users = await Promise.all(
			members.map(async (m) => {
				const user = await this.userRepo.findById(m.userId);
				return user
					? {
							id: user.id,
							username: user.username,
							displayName: user.displayName,
							avatarUrl: user.avatarUrl,
							role: m.role,
						}
					: null;
			}),
		);

		return users.filter(Boolean);
	}
}
