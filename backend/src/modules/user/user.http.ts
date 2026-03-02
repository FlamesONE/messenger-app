import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import type { GetProfileUseCase } from "./use-cases/get-profile";
import type { UpdateProfileUseCase } from "./use-cases/update-profile";

export function userHttp(
	getProfileUC: GetProfileUseCase,
	updateProfileUC: UpdateProfileUseCase,
) {
	return new Elysia({ name: "user-http", prefix: "/users" })
		.use(authGuard)
		.get("/me", async ({ userId }) => {
			return getProfileUC.execute(userId);
		})
		.patch(
			"/me",
			async ({ body, userId }) => {
				return updateProfileUC.execute(userId, body);
			},
			{
				body: t.Object({
					displayName: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
					avatarUrl: t.Optional(t.Nullable(t.String())),
				}),
			},
		)
		.get(
			"/:id",
			async ({ params }) => {
				return getProfileUC.execute(params.id);
			},
			{
				params: t.Object({ id: t.String() }),
			},
		);
}
