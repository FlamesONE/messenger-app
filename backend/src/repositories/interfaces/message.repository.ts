export interface MediaAttachment {
	url: string;
	key: string;
	type: string;
	size: number;
	name: string;
}

export interface MessageRecord {
	id: string;
	chatId: string;
	senderId: string;
	content: string;
	media: MediaAttachment[];
	replyTo: string | null;
	editedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface CreateMessageData {
	chatId: string;
	senderId: string;
	content: string;
	media?: MediaAttachment[];
	replyTo?: string;
}

export interface GetMessagesParams {
	chatId: string;
	limit?: number;
	before?: Date;
}

export interface ReactionRecord {
	chatId: string;
	messageId: string;
	userId: string;
	emoji: string;
	createdAt: Date;
}

export interface SearchMessagesParams {
	chatId: string;
	query: string;
	limit?: number;
	before?: Date;
}

export interface IMessageRepository {
	findById(chatId: string, messageId: string): Promise<MessageRecord | null>;
	getHistory(params: GetMessagesParams): Promise<MessageRecord[]>;
	getLastMessage(chatId: string): Promise<MessageRecord | null>;
	searchMessages(params: SearchMessagesParams): Promise<MessageRecord[]>;
	create(data: CreateMessageData): Promise<MessageRecord>;
	update(chatId: string, messageId: string, content: string): Promise<MessageRecord | null>;
	delete(chatId: string, messageId: string): Promise<void>;
	markAsRead(chatId: string, messageId: string, userId: string): Promise<void>;
	markAsReadBatch(chatId: string, messageIds: string[], userId: string): Promise<void>;
	addReaction(chatId: string, messageId: string, userId: string, emoji: string): Promise<ReactionRecord>;
	removeReaction(chatId: string, messageId: string, userId: string, emoji: string): Promise<void>;
	getReactions(chatId: string, messageId: string): Promise<ReactionRecord[]>;
	getReactionsBatch(chatId: string, messageIds: string[]): Promise<Map<string, ReactionRecord[]>>;
	getReaders(chatId: string, messageId: string): Promise<string[]>;
	getReadersBatch(chatId: string, messageIds: string[]): Promise<Map<string, string[]>>;
}
