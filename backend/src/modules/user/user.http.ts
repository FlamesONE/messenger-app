import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import type { EventBus } from "@/infrastructure/event-bus/event-bus";
import type { GetProfileUseCase } from "./use-cases/get-profile";
import type { SearchUsersUseCase } from "./use-cases/search-users";
import type { UpdateProfileUseCase } from "./use-cases/update-profile";

export function userHttp(
	getProfileUC: GetProfileUseCase,
	updateProfileUC: UpdateProfileUseCase,
	searchUsersUC: SearchUsersUseCase,
	eventBus: EventBus,
) {
	return new Elysia({ name: "user-http", prefix: "/users" })
		.use(authGuard)
		.get("/me", async ({ userId }) => {
			return getProfileUC.execute(userId);
		}, { auth: true })
		.get(
			"/search",
			async ({ query, userId }) => {
				return searchUsersUC.execute(query.q, userId, query.limit ? Number(query.limit) : undefined);
			},
			{
				auth: true,
				query: t.Object({
					q: t.String({ minLength: 1 }),
					limit: t.Optional(t.String()),
				}),
			},
		)
		.patch(
			"/me",
			async ({ body, userId }) => {
				const updated = await updateProfileUC.execute(userId, body);

				eventBus.emit("broadcast:user-contacts", {
					userId,
					message: {
						event: "user:updated",
						data: {
							userId,
							displayName: updated.displayName,
							avatarUrl: updated.avatarUrl ?? null,
							username: updated.username,
						},
					},
				});

				return updated;
			},
			{
				auth: true,
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
