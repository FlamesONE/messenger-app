import { Elysia, t } from "elysia";
import { env } from "@/shared/config/env";
import type { IJobQueue } from "@/infrastructure/bullmq/types";
import { authGuard } from "@/transport/auth.guard";
import { uploadRateLimit } from "@/transport/rate-limit";
import type { MediaProcessingJobData } from "./jobs/media-processing.types";
import type { UploadFileUseCase } from "./use-cases/upload-file";

export function uploadHttp(
	uploadFileUC: UploadFileUseCase,
	mediaProcessingQueue: IJobQueue<MediaProcessingJobData>,
) {
	return new Elysia({ name: "upload-http", prefix: "/upload" })
		.use(uploadRateLimit)
		.use(authGuard)
		.post(
			"/",
			async ({ body, userId }) => {
				const result = await uploadFileUC.execute(body.file);

				await mediaProcessingQueue.add("process-upload", {
					key: result.key,
					bucket: env.S3_BUCKET,
					type: result.type,
					uploadedBy: userId,
				});

				return result;
			},
			{
				auth: true,
				body: t.Object({
					file: t.File({ maxSize: "10m" }),
				}),
			},
		);
}
