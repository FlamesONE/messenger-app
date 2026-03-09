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
	name: string;
}

export interface FileMeta {
	name: string;
	type: string;
	size: number;
}

export interface FileObject {
	body: ReadableStream | Buffer | null;
	contentType: string | undefined;
	contentLength: number | undefined;
}

export interface IFileStorage {
	upload(file: FileData): Promise<UploadResult>;
	delete(key: string): Promise<void>;
	getUrl(key: string): string;
	getObject(key: string): Promise<FileObject>;
	getMeta(key: string): FileMeta | undefined;
}
