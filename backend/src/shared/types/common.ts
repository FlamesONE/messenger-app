export interface Paginated<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface AuthContext {
	userId: string;
}
