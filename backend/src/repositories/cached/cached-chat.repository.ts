import type { CacheService } from "@/infrastructure/redis/cache.service";
import type {
	ChatMemberRecord,
	ChatRecord,
	CreateChatData,
	IChatRepository,
} from "../interfaces/chat.repository";

const TTL = 300; // 5 min
const MEMBER_TTL = 300; // 5 min — hot path (isMember)
const CHATS_TTL = 120; // 2 min — user's chat list

export class CachedChatRepository implements IChatRepository {
	constructor(
		private readonly pgChatRepo: IChatRepository,
		private readonly cacheService: CacheService,
	) {}

	async findById(id: string): Promise<ChatRecord | null> {
		const key = `chat:${id}`;
		const cached = await this.cacheService.get<ChatRecord>(key);
		if (cached) return cached;

		const chat = await this.pgChatRepo.findById(id);
		if (chat) await this.cacheService.set(key, chat, TTL);
		return chat;
	}

	async findByUserId(userId: string): Promise<ChatRecord[]> {
		const key = `user-chats:${userId}`;
		const cached = await this.cacheService.get<ChatRecord[]>(key);
		if (cached) return cached;

		const chats = await this.pgChatRepo.findByUserId(userId);
		await this.cacheService.set(key, chats, CHATS_TTL);
		return chats;
	}

	async create(data: CreateChatData): Promise<ChatRecord> {
		const chat = await this.pgChatRepo.create(data);
		for (const memberId of data.memberIds) {
			await this.cacheService.del(`user-chats:${memberId}`);
		}
		return chat;
	}

	async addMember(
		chatId: string,
		userId: string,
		role?: "admin" | "member",
	): Promise<void> {
		await this.pgChatRepo.addMember(chatId, userId, role);
		await this.cacheService.del(
			`user-chats:${userId}`,
			`chat-member:${chatId}:${userId}`,
			`chat-members:${chatId}`,
		);
	}

	async removeMember(chatId: string, userId: string): Promise<void> {
		await this.pgChatRepo.removeMember(chatId, userId);
		await this.cacheService.del(
			`user-chats:${userId}`,
			`chat-member:${chatId}:${userId}`,
			`chat-members:${chatId}`,
		);
	}

	async getMembers(chatId: string): Promise<ChatMemberRecord[]> {
		const key = `chat-members:${chatId}`;
		const cached = await this.cacheService.get<ChatMemberRecord[]>(key);
		if (cached) return cached;

		const members = await this.pgChatRepo.getMembers(chatId);
		await this.cacheService.set(key, members, TTL);
		return members;
	}

	async isMember(chatId: string, userId: string): Promise<boolean> {
		const key = `chat-member:${chatId}:${userId}`;
		const cached = await this.cacheService.get<boolean>(key);
		if (cached !== null) return cached;

		const result = await this.pgChatRepo.isMember(chatId, userId);
		await this.cacheService.set(key, result, MEMBER_TTL);
		return result;
	}
}
