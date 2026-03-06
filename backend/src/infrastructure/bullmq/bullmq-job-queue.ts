import { Queue, type QueueOptions } from "bullmq";
import type { IJobQueue } from "@/infrastructure/bullmq/types";
import { bullmqConnection } from "./connection";

export class BullMQJobQueue<T> implements IJobQueue<T> {
	private queue: Queue;

	constructor(name: string, opts?: Partial<QueueOptions["defaultJobOptions"]>) {
		this.queue = new Queue(name, {
			connection: bullmqConnection,
			defaultJobOptions: {
				removeOnComplete: 100,
				removeOnFail: 500,
				attempts: 3,
				backoff: { type: "exponential", delay: 1000 },
				...opts,
			},
		});
	}

	async add(name: string, data: T): Promise<void> {
		await this.queue.add(name, data as Record<string, unknown>);
	}

	async close(): Promise<void> {
		await this.queue.close();
	}
}
