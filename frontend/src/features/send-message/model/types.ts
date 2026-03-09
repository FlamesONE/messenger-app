export interface PendingFile {
	id: string;
	file: File;
	preview?: string;
	key?: string;
	progress: number;
	uploading: boolean;
	error?: string;
}
