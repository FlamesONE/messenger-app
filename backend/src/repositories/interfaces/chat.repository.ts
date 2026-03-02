export interface ChatRecord {
	id: string;
	name: string | null;
	isGroup: boolean;
	createdById: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatMemberRecord {
	chatId: string;
	userId: string;
	role: "owner" | "admin" | "member";
	joinedAt: Date;
}

export interface CreateChatData {
	name?: string;
	isGroup: boolean;
	createdById: string;
	memberIds: string[];
}

export interface IChatRepository {
	findById(id: string): Promise<ChatRecord | null>;
	findByUserId(userId: string): Promise<ChatRecord[]>;
	create(data: CreateChatData): Promise<ChatRecord>;
	addMember(
		chatId: string,
		userId: string,
		role?: "admin" | "member",
	): Promise<void>;
	removeMember(chatId: string, userId: string): Promise<void>;
	getMembers(chatId: string): Promise<ChatMemberRecord[]>;
	isMember(chatId: string, userId: string): Promise<boolean>;
}
