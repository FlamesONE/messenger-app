export interface ChatRecord {
	id: string;
	name: string | null;
	isGroup: boolean;
	inviteCode: string | null;
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
	findDmBetween(userIdA: string, userIdB: string): Promise<ChatRecord | null>;
	findByInviteCode(code: string): Promise<ChatRecord | null>;
	create(data: CreateChatData): Promise<ChatRecord>;
	setInviteCode(chatId: string, code: string): Promise<void>;
	addMember(
		chatId: string,
		userId: string,
		role?: "admin" | "member",
	): Promise<void>;
	removeMember(chatId: string, userId: string): Promise<void>;
	deleteChat(chatId: string): Promise<void>;
	getMembers(chatId: string): Promise<ChatMemberRecord[]>;
	isMember(chatId: string, userId: string): Promise<boolean>;
}
