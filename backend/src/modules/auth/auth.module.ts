import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { authHttp } from "./auth.http";
import { LoginUseCase } from "./use-cases/login";
import { RegisterUseCase } from "./use-cases/register";

export function createAuthModule(userRepo: IUserRepository) {
	const registerUC = new RegisterUseCase(userRepo);
	const loginUC = new LoginUseCase(userRepo);

	return {
		http: authHttp(registerUC, loginUC),
	};
}
