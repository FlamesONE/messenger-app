import type { GetProfileUseCase } from "./use-cases/get-profile";
import type { UpdateProfileUseCase } from "./use-cases/update-profile";
import { userHttp } from "./user.http";

export function createUserModule(
	getProfileUC: GetProfileUseCase,
	updateProfileUC: UpdateProfileUseCase,
) {
	return {
		http: userHttp(getProfileUC, updateProfileUC),
	};
}
