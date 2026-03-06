import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import { BadRequestError } from "@/shared/errors";

const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export class UploadFileUseCase {
	constructor(private readonly fileStorage: IFileStorage) {}

	async execute(file: File) {
		if (!ALLOWED_TYPES.includes(file.type)) {
			throw new BadRequestError(`File type '${file.type}' is not allowed`);
		}

		if (file.size > MAX_SIZE) {
			throw new BadRequestError("File size exceeds 10MB limit");
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		return this.fileStorage.upload({
			buffer,
			name: file.name,
			type: file.type,
			size: file.size,
		});
	}
}
