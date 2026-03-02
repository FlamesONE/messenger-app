import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import { uploadHttp } from "./upload.http";
import { UploadFileUseCase } from "./use-cases/upload-file";

export function createUploadModule(fileStorage: IFileStorage) {
	const uploadFileUC = new UploadFileUseCase(fileStorage);

	return {
		http: uploadHttp(uploadFileUC),
	};
}
