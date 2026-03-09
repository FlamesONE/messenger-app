import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { CreateChatDto } from "../dto/create-chat.dto";

export class CreateChatUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(createdById: string, dto: CreateChatDto) {
		const allMemberIds = [...new Set([createdById, ...dto.memberIds])];

		if (!dto.isGroup && allMemberIds.length === 2) {
			const otherId = allMemberIds.find((id) => id !== createdById)!;
			const existing = await this.chatRepo.findDmBetween(createdById, otherId);
			if (existing) return existing;
		}

		return this.chatRepo.create({
			name: dto.name,
			isGroup: dto.isGroup,
			createdById,
			memberIds: allMemberIds,
		});
	}
}
