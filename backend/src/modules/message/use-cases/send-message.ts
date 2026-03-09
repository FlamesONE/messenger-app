import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import type {
	IMessageRepository,
	MediaAttachment,
} from "@/repositories/interfaces/message.repository";
import { BadRequestError, ForbiddenError } from "@/shared/errors";
import type { SendMessageDto } from "../dto/send-message.dto";

export class SendMessageUseCase {
	constructor(
		private readonly messageRepo: IMessageRepository,
		private readonly chatRepo: IChatRepository,
		private readonly fileStorage: IFileStorage,
	) {}

	async execute(senderId: string, dto: SendMessageDto) {
		if (!dto.content && (!dto.mediaKeys || dto.mediaKeys.length === 0)) {
			throw new BadRequestError(
				"Message must have content or media attachments",
			);
		}

		const isMember = await this.chatRepo.isMember(dto.chatId, senderId);
		if (!isMember) {
			throw new ForbiddenError("You are not a member of this chat");
		}

		let media: MediaAttachment[] = [];
		if (dto.mediaKeys && dto.mediaKeys.length > 0) {
			media = dto.mediaKeys.map((key) => {
				const meta = this.fileStorage.getMeta(key);
				if (meta) {
					return {
						url: this.fileStorage.getUrl(key),
						key,
						type: meta.type,
						size: meta.size,
						name: meta.name,
					};
				}
				const ext = key.split(".").pop() ?? "bin";
				return {
					url: this.fileStorage.getUrl(key),
					key,
					type: `application/${ext}`,
					size: 0,
					name: key.split("/").pop() ?? key,
				};
			});
		}

		return this.messageRepo.create({
			chatId: dto.chatId,
			senderId,
			content: dto.content,
			media,
			replyTo: dto.replyTo,
		});
	}
}
