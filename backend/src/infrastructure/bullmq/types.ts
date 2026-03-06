export interface IJobQueue<T> {
	add(name: string, data: T): Promise<void>;
	close(): Promise<void>;
}

export interface IJobHandler<T> {
	handle(data: T): Promise<void>;
}
