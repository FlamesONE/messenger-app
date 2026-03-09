import type { AppContext } from "@/infrastructure/di/container";
import { userHttp } from "./user.http";
import { GetProfileUseCase } from "./use-cases/get-profile";
import { UpdateProfileUseCase } from "./use-cases/update-profile";
import { SearchUsersUseCase } from "./use-cases/search-users";

export function createUserModule(ctx: AppContext) {
	const getProfileUC = new GetProfileUseCase(ctx.userRepo);
	const updateProfileUC = new UpdateProfileUseCase(ctx.userRepo);
	const searchUsersUC = new SearchUsersUseCase(ctx.userRepo);

	return {
		http: userHttp(getProfileUC, updateProfileUC, searchUsersUC, ctx.eventBus),
	};
}
