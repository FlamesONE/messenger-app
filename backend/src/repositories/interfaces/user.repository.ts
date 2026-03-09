export interface UserRecord {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserData {
	email: string;
	username: string;
	displayName: string;
	passwordHash: string;
}

export interface UpdateUserData {
	displayName?: string;
	avatarUrl?: string | null;
}

export interface IUserRepository {
	findById(id: string): Promise<UserRecord | null>;
	findByEmail(email: string): Promise<UserRecord | null>;
	findByUsername(username: string): Promise<UserRecord | null>;
	search(query: string, limit?: number): Promise<UserRecord[]>;
	create(data: CreateUserData): Promise<UserRecord>;
	update(id: string, data: UpdateUserData): Promise<UserRecord | null>;
}
