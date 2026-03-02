import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import { uploadRateLimit } from "@/transport/rate-limit";
import type { UploadFileUseCase } from "./use-cases/upload-file";

export function uploadHttp(uploadFileUC: UploadFileUseCase) {
	return new Elysia({ name: "upload-http", prefix: "/upload" })
		.use(uploadRateLimit)
		.use(authGuard)
		.post(
			"/",
			async ({ body }) => {
				return uploadFileUC.execute(body.file);
			},
			{
				body: t.Object({
					file: t.File({ maxSize: "10m" }),
				}),
			},
		);
}
