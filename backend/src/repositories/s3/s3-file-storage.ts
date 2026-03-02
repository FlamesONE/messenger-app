import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import type {
	FileData,
	IFileStorage,
	UploadResult,
} from "@/repositories/interfaces/file-storage";
import { env } from "@/shared/config/env";

export class S3FileStorage implements IFileStorage {
	private client: S3Client;

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
			}),
		);

		return {
			url: this.getUrl(key),
			key,
			size: file.size,
			type: file.type,
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

	getUrl(key: string): string {
		return env.S3_ENDPOINT
			? `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`
			: `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
	}
}
