import { Elysia } from "elysia";
import { jwtPlugin } from "@/transport/auth.guard";
import { authRateLimit } from "@/transport/rate-limit";
import { loginDto } from "./dto/login.dto";
import { registerDto } from "./dto/register.dto";
import type { LoginUseCase } from "./use-cases/login";
import type { RegisterUseCase } from "./use-cases/register";

export function authHttp(registerUC: RegisterUseCase, loginUC: LoginUseCase) {
	return new Elysia({ name: "auth-http", prefix: "/auth" })
		.use(authRateLimit)
		.use(jwtPlugin)
		.post(
			"/register",
			async ({ body, jwt }) => {
				const user = await registerUC.execute(body);
				const token = await jwt.sign({ sub: user.id });
				return { user, token };
			},
			{ body: registerDto },
		)
		.post(
			"/login",
			async ({ body, jwt }) => {
				const user = await loginUC.execute(body);
				const token = await jwt.sign({ sub: user.id });
				return { user, token };
			},
			{ body: loginDto },
		);
}
