import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { NotFoundError } from "@/shared/errors";

interface UpdateProfileData {
	displayName?: string;
	avatarUrl?: string | null;
}

export class UpdateProfileUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(userId: string, data: UpdateProfileData) {
		const updated = await this.userRepo.update(userId, data);
		if (!updated) {
			throw new NotFoundError("User", userId);
		}

		return {
			id: updated.id,
			email: updated.email,
			username: updated.username,
			displayName: updated.displayName,
			avatarUrl: updated.avatarUrl,
		};
	}
}
