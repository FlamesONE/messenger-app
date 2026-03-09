import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import { BadRequestError } from "@/shared/errors";

const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"video/mp4",
	"video/webm",
	"video/quicktime",
	"audio/mpeg",
	"audio/ogg",
	"audio/wav",
	"audio/webm",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/zip",
	"application/x-rar-compressed",
	"application/x-7z-compressed",
	"application/gzip",
	"text/plain",
	"text/csv",
	"application/json",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export class UploadFileUseCase {
	constructor(private readonly fileStorage: IFileStorage) {}

	async execute(file: File) {
		const baseType = file.type.split(";")[0].trim().toLowerCase();

		if (!ALLOWED_TYPES.includes(baseType)) {
			throw new BadRequestError(`File type '${file.type}' is not allowed`);
		}

		if (file.size > MAX_SIZE) {
			throw new BadRequestError("File size exceeds 50MB limit");
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		return this.fileStorage.upload({
			buffer,
			name: file.name,
			type: baseType,
			size: file.size,
		});
	}
}
