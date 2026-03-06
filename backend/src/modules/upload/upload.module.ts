import type { IJobQueue } from "@/infrastructure/bullmq/types";
import type { MediaProcessingJobData } from "./jobs/media-processing.types";
import { uploadHttp } from "./upload.http";
import type { UploadFileUseCase } from "./use-cases/upload-file";

export function createUploadModule(
	uploadFileUC: UploadFileUseCase,
	mediaProcessingQueue: IJobQueue<MediaProcessingJobData>,
) {
	return {
		http: uploadHttp(uploadFileUC, mediaProcessingQueue),
	};
}
