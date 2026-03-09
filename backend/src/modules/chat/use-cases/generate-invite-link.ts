import { nanoid } from "nanoid";
import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

export class GenerateInviteLinkUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(requesterId: string, chatId: string) {
		const chat = await this.chatRepo.findById(chatId);
		if (!chat) throw new NotFoundError("Chat", chatId);
		if (!chat.isGroup) throw new ForbiddenError("Invite links are only available for group chats");

		const members = await this.chatRepo.getMembers(chatId);
		const requester = members.find((m) => m.userId === requesterId);
		if (!requester) throw new ForbiddenError("You are not a member of this chat");
		if (requester.role !== "owner" && requester.role !== "admin") {
			throw new ForbiddenError("Only owner or admin can generate invite links");
		}

		if (chat.inviteCode) return chat.inviteCode;

		const code = nanoid(16);
		await this.chatRepo.setInviteCode(chatId, code);
		return code;
	}
}
