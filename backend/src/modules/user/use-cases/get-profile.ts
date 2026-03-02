import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { NotFoundError } from "@/shared/errors";

export class GetProfileUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(userId: string) {
		const user = await this.userRepo.findById(userId);
		if (!user) {
			throw new NotFoundError("User", userId);
		}

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
		};
	}
}
