export interface FileData {
	buffer: Buffer;
	name: string;
	type: string;
	size: number;
}

export interface UploadResult {
	url: string;
	key: string;
	size: number;
	type: string;
}

export interface IFileStorage {
	upload(file: FileData): Promise<UploadResult>;
	delete(key: string): Promise<void>;
	getUrl(key: string): string;
}
