import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import type {
	FileData,
	FileMeta,
	FileObject,
	IFileStorage,
	UploadResult,
} from "@/repositories/interfaces/file-storage";
import { env } from "@/shared/config/env";

export class S3FileStorage implements IFileStorage {
	private client: S3Client;
	private metaCache = new Map<string, FileMeta>();

	constructor() {
		this.client = new S3Client({
			region: env.S3_REGION,
			endpoint: env.S3_ENDPOINT,
			credentials:
				env.S3_ACCESS_KEY && env.S3_SECRET_KEY
					? {
							accessKeyId: env.S3_ACCESS_KEY,
							secretAccessKey: env.S3_SECRET_KEY,
						}
					: undefined,
			forcePathStyle: true,
		});
	}

	async upload(file: FileData): Promise<UploadResult> {
		const ext = file.name.split(".").pop() ?? "bin";
		const key = `uploads/${nanoid()}.${ext}`;

		await this.client.send(
			new PutObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: key,
				Body: file.buffer,
				ContentType: file.type,
				CacheControl: "public, max-age=31536000, immutable",
			}),
		);

		this.metaCache.set(key, { name: file.name, type: file.type, size: file.size });

		return {
			url: this.getUrl(key),
			key,
			size: file.size,
			type: file.type,
			name: file.name,
		};
	}

	async delete(key: string): Promise<void> {
		await this.client.send(
			new DeleteObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: key,
			}),
		);
	}

	async getObject(key: string): Promise<FileObject> {
		const response = await this.client.send(
			new GetObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: key,
			}),
		);

		const body = response.Body
			? (response.Body.transformToWebStream() as ReadableStream)
			: null;

		return {
			body,
			contentType: response.ContentType,
			contentLength: response.ContentLength,
		};
	}

	getMeta(key: string): FileMeta | undefined {
		return this.metaCache.get(key);
	}

	getUrl(key: string): string {
		return `/api/files/${encodeURIComponent(key)}`;
	}
}
