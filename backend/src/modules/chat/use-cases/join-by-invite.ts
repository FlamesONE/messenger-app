import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import { NotFoundError } from "@/shared/errors";

export class JoinByInviteUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(userId: string, inviteCode: string) {
		const chat = await this.chatRepo.findByInviteCode(inviteCode);
		if (!chat || !chat.isGroup) throw new NotFoundError("Invite link is invalid or expired");

		const alreadyMember = await this.chatRepo.isMember(chat.id, userId);
		if (!alreadyMember) {
			await this.chatRepo.addMember(chat.id, userId);
		}

		return chat;
	}
}
