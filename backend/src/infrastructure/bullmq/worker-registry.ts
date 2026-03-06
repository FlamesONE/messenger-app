import { Worker } from "bullmq";
import type { IJobHandler } from "@/infrastructure/bullmq/types";
import { logger } from "@/shared/logger";
import { bullmqConnection } from "./connection";

interface WorkerRegistration {
	queueName: string;
	handler: IJobHandler<unknown>;
	concurrency: number;
}

const registrations: WorkerRegistration[] = [];
const workers: Worker[] = [];

export function registerWorker<T>(
	queueName: string,
	handler: IJobHandler<T>,
	concurrency = 5,
): void {
	registrations.push({
		queueName,
		handler: handler as IJobHandler<unknown>,
		concurrency,
	});
}

export function startWorkers(): void {
	for (const reg of registrations) {
		const worker = new Worker(
			reg.queueName,
			async (job) => {
				await reg.handler.handle(job.data);
			},
			{
				connection: bullmqConnection,
				concurrency: reg.concurrency,
			},
		);

		worker.on("failed", (job, err) => {
			logger.error(
				{ jobId: job?.id, queue: reg.queueName, err },
				"Job failed",
			);
		});

		workers.push(worker);
	}

	logger.info(
		{ queues: registrations.map((r) => r.queueName) },
		"BullMQ workers started",
	);
}

export async function stopWorkers(): Promise<void> {
	await Promise.all(workers.map((w) => w.close()));
	workers.length = 0;
	logger.info("BullMQ workers stopped");
}
