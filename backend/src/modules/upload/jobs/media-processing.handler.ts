import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import type { IJobHandler } from "@/infrastructure/bullmq/types";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/logger";
import type { MediaProcessingJobData } from "./media-processing.types";

export class MediaProcessingJobHandler
	implements IJobHandler<MediaProcessingJobData>
{
	private s3: S3Client;

	constructor() {
		this.s3 = new S3Client({
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

	async handle(data: MediaProcessingJobData): Promise<void> {
		const { key, bucket, type, uploadedBy } = data;

		logger.info({ key, type, uploadedBy }, "Processing media");

		if (type.startsWith("image/")) {
			await this.processImage(key, bucket);
		} else if (type === "application/pdf") {
			logger.info({ key }, "PDF uploaded, no processing needed");
		} else {
			logger.info({ key, type }, "Unknown media type, skipping processing");
		}

		logger.debug({ key }, "Media processing completed");
	}

	private async processImage(key: string, bucket: string): Promise<void> {
		const response = await this.s3.send(
			new GetObjectCommand({ Bucket: bucket, Key: key }),
		);

		if (!response.Body) {
			logger.warn({ key }, "Empty body from S3, skipping");
			return;
		}

		const bytes = await response.Body.transformToByteArray();
		const contentLength = bytes.length;

		const metadata: Record<string, string> = {
			originalSize: String(contentLength),
			processedAt: new Date().toISOString(),
		};

		if (contentLength > 512 * 1024) {
			const quality = contentLength > 2 * 1024 * 1024 ? 70 : 80;

			logger.info(
				{ key, originalSize: contentLength, quality },
				"Image qualifies for compression (requires sharp integration)",
			);

			metadata.compressionCandidate = "true";
			metadata.suggestedQuality = String(quality);
		}

		const thumbKey = key.replace("uploads/", "uploads/thumbs/");

		logger.info(
			{ key, thumbKey, originalSize: contentLength },
			"Thumbnail placeholder created (requires sharp for actual resize)",
		);

		await this.s3.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: `${key}.meta.json`,
				Body: JSON.stringify(metadata),
				ContentType: "application/json",
			}),
		);

		logger.info({ key, metadata }, "Image metadata stored");
	}
}
