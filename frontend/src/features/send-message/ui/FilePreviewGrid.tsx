import { memo, useCallback, useState } from "react";
import { Lightbox } from "@/shared/ui/lightbox";
import { DocThumb } from "./DocThumb";
import { ImageThumb } from "./ImageThumb";
import type { PendingFile } from "../model/types";

interface FilePreviewGridProps {
	files: PendingFile[];
	onRemove: (id: string) => void;
}

export const FilePreviewGrid = memo(function FilePreviewGrid({ files, onRemove }: FilePreviewGridProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handlePreview = useCallback((url?: string) => {
		if (url) setPreviewUrl(url);
	}, []);

	const handleClosePreview = useCallback(() => {
		setPreviewUrl(null);
	}, []);

	const previewMedia = previewUrl ? [{ url: previewUrl, name: "", type: "image/" }] : [];

	return (
		<>
			<div className="flex gap-2 overflow-x-auto px-3 pt-2.5 pb-1 scrollbar-none">
				{files.map((pf) =>
					pf.preview ? (
						<ImageThumb key={pf.id} file={pf} onRemove={onRemove} onPreview={handlePreview} />
					) : (
						<DocThumb key={pf.id} file={pf} onRemove={onRemove} />
					),
				)}
			</div>
			<Lightbox
				media={previewMedia}
				initialIndex={0}
				open={!!previewUrl}
				onClose={handleClosePreview}
			/>
		</>
	);
});
