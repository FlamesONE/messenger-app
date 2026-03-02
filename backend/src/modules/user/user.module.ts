import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { GetProfileUseCase } from "./use-cases/get-profile";
import { UpdateProfileUseCase } from "./use-cases/update-profile";
import { userHttp } from "./user.http";

export function createUserModule(userRepo: IUserRepository) {
	const getProfileUC = new GetProfileUseCase(userRepo);
	const updateProfileUC = new UpdateProfileUseCase(userRepo);

	return {
		http: userHttp(getProfileUC, updateProfileUC),
	};
}
