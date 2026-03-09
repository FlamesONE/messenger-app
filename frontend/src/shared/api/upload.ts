import { useAuthStore } from "@/entities/user";
import type { ApiUploadResult as UploadResult } from "@backend/shared/types/api-types";

const baseUrl =
	import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}/api`;

export async function uploadFile(
	file: File,
	onProgress?: (percent: number) => void,
): Promise<UploadResult> {
	const token = useAuthStore.getState().token;
	const formData = new FormData();
	formData.append("file", file);

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", `${baseUrl}/upload`);

		if (token) {
			xhr.setRequestHeader("Authorization", `Bearer ${token}`);
		}

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable && onProgress) {
				onProgress(Math.round((e.loaded / e.total) * 100));
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(JSON.parse(xhr.responseText));
			} else {
				reject(new Error(`Upload failed: ${xhr.statusText}`));
			}
		};

		xhr.onerror = () => reject(new Error("Upload failed"));
		xhr.send(formData);
	});
}

export const ALLOWED_FILE_TYPES = [
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

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
