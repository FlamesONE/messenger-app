import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { CreateChatDto } from "../dto/create-chat.dto";

export class CreateChatUseCase {
	constructor(private readonly chatRepo: IChatRepository) {}

	async execute(createdById: string, dto: CreateChatDto) {
		const allMemberIds = [...new Set([createdById, ...dto.memberIds])];

		return this.chatRepo.create({
			name: dto.name,
			isGroup: dto.isGroup,
			createdById,
			memberIds: allMemberIds,
		});
	}
}
