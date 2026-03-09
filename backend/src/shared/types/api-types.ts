/**
 * API response types — contract between backend and frontend.
 * Frontend imports these directly via @backend/shared/types/api-types.
 */

// ─── User ─────────────────────────────────────────────────

export interface ApiUser {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

// ─── Chat ─────────────────────────────────────────────────

export interface ApiDmUser {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
}

export interface ApiLastMessage {
	content: string;
	senderId: string;
	createdAt: string;
}

export interface ApiChat {
	id: string;
	name: string | null;
	isGroup: boolean;
	inviteCode: string | null;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	dmUser: ApiDmUser | null;
	lastMessage: ApiLastMessage | null;
}

export interface ApiChatMember {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	role: "owner" | "admin" | "member";
}

// ─── Message ──────────────────────────────────────────────

export interface ApiMediaAttachment {
	url: string;
	key: string;
	type: string;
	size: number;
	name: string;
}

export interface ApiReaction {
	emoji: string;
	userId: string;
}

export interface ApiMessage {
	id: string;
	chatId: string;
	senderId: string;
	content: string;
	media: ApiMediaAttachment[];
	reactions: ApiReaction[];
	readBy: string[];
	replyTo: string | null;
	editedAt: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface ApiSendMessagePayload {
	chatId: string;
	content: string;
	mediaKeys?: string[];
	replyTo?: string;
}

// ─── Upload ───────────────────────────────────────────────

export interface ApiUploadResult {
	url: string;
	key: string;
	size: number;
	type: string;
}
