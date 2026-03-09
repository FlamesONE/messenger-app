import type { AppContext } from "@/infrastructure/di/container";
import { registerWorker } from "@/infrastructure/bullmq/worker-registry";
import { filesHttp } from "./files.http";
import { MediaProcessingJobHandler } from "./jobs/media-processing.handler";
import { uploadHttp } from "./upload.http";
import { UploadFileUseCase } from "./use-cases/upload-file";

export function createUploadModule(ctx: AppContext) {
	const uploadFileUC = new UploadFileUseCase(ctx.fileStorage);

	// job handlers
	const mediaHandler = new MediaProcessingJobHandler();
	registerWorker("media-processing", mediaHandler, 3);

	return {
		http: uploadHttp(uploadFileUC, ctx.mediaProcessingQueue),
		filesProxy: filesHttp(ctx.fileStorage),
	};
}
