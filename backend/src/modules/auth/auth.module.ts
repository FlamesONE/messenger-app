import type { LoginUseCase } from "./use-cases/login";
import type { RegisterUseCase } from "./use-cases/register";
import { authHttp } from "./auth.http";

export function createAuthModule(
	registerUC: RegisterUseCase,
	loginUC: LoginUseCase,
) {
	return {
		http: authHttp(registerUC, loginUC),
	};
}
