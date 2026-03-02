import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import { db } from "@/infrastructure/pg/model";
import type { GetProfileUseCase } from "./use-cases/get-profile";
import type { UpdateProfileUseCase } from "./use-cases/update-profile";

const { displayName, avatarUrl } = db.insert.user;

export function userHttp(
	getProfileUC: GetProfileUseCase,
	updateProfileUC: UpdateProfileUseCase,
) {
	return new Elysia({ name: "user-http", prefix: "/users" })
		.use(authGuard)
		.get("/me", async ({ userId }) => {
			return getProfileUC.execute(userId);
		}, { auth: true })
		.patch(
			"/me",
			async ({ body, userId }) => {
				return updateProfileUC.execute(userId, body);
			},
			{
				auth: true,
				body: t.Object({
					displayName: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
					avatarUrl: t.Optional(t.Nullable(avatarUrl)),
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
