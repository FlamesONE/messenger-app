import type { AppContext } from "@/infrastructure/di/container";
import { authHttp } from "./auth.http";
import { RegisterUseCase } from "./use-cases/register";
import { LoginUseCase } from "./use-cases/login";

export function createAuthModule(ctx: AppContext) {
	const registerUC = new RegisterUseCase(ctx.userRepo);
	const loginUC = new LoginUseCase(ctx.userRepo);

	return {
		http: authHttp(registerUC, loginUC),
	};
}
