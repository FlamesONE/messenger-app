import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { logger } from "@/shared/logger";

interface DmUser {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
}

interface LastMessage {
	content: string;
	senderId: string;
	createdAt: string;
}

interface EnrichedChat {
	id: string;
	name: string | null;
	isGroup: boolean;
	inviteCode: string | null;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	dmUser: DmUser | null;
	lastMessage: LastMessage | null;
}

export class GetUserChatsUseCase {
	constructor(
		private readonly chatRepo: IChatRepository,
		private readonly userRepo: IUserRepository,
		private readonly messageRepo: IMessageRepository,
	) {}

	async execute(userId: string): Promise<EnrichedChat[]> {
		const chats = await this.chatRepo.findByUserId(userId);

		const enriched: EnrichedChat[] = await Promise.all(
			chats.map(async (chat) => {
				let lastMessage: LastMessage | null = null;
				let dmUser: DmUser | null = null;

				try {
					const lastMsg = await this.messageRepo.getLastMessage(chat.id);
					if (lastMsg) {
						lastMessage = {
							content: lastMsg.content,
							senderId: lastMsg.senderId,
							createdAt: lastMsg.createdAt.toISOString(),
						};
					}
				} catch (err) {
					logger.warn({ chatId: chat.id, err }, "Failed to fetch lastMessage from ScyllaDB");
				}

				try {
					dmUser = await this.resolveDmUser(chat, userId);
				} catch (err) {
					logger.warn({ chatId: chat.id, err }, "Failed to resolve dmUser");
				}

				return {
					id: chat.id,
					name: chat.name,
					isGroup: chat.isGroup,
					inviteCode: chat.inviteCode,
					createdById: chat.createdById,
					createdAt: chat.createdAt instanceof Date ? chat.createdAt.toISOString() : String(chat.createdAt),
					updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : String(chat.updatedAt),
					dmUser,
					lastMessage,
				};
			}),
		);

		return enriched.sort((a, b) => {
			const tA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
			const tB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
			return tB - tA;
		});
	}

	private async resolveDmUser(chat: { id: string; isGroup: boolean }, userId: string): Promise<DmUser | null> {
		if (chat.isGroup) return null;

		const members = await this.chatRepo.getMembers(chat.id);
		const otherId = members.find((m) => m.userId !== userId)?.userId;
		if (!otherId) return null;

		const user = await this.userRepo.findById(otherId);
		return user
			? { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl }
			: null;
	}
}
