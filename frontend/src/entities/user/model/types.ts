export interface User {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl?: string | null;
	createdAt?: string;
}
