import type { IUserRepository } from "@/repositories/interfaces/user.repository";

export class SearchUsersUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(query: string, excludeUserId: string, limit = 20) {
		if (!query || query.trim().length < 1) return [];

		const users = await this.userRepo.search(query.trim(), limit + 1);

		return users
			.filter((u) => u.id !== excludeUserId)
			.slice(0, limit)
			.map((u) => ({
				id: u.id,
				email: u.email,
				username: u.username,
				displayName: u.displayName,
				avatarUrl: u.avatarUrl,
				createdAt: u.createdAt,
			}));
	}
}
