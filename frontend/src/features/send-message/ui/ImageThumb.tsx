import { Loader2, Play, X } from "lucide-react";
import { memo, useCallback } from "react";
import type { PendingFile } from "../model/types";

interface ImageThumbProps {
	file: PendingFile;
	onRemove: (id: string) => void;
	onPreview: (url?: string) => void;
}

export const ImageThumb = memo(function ImageThumb({ file: pf, onRemove, onPreview }: ImageThumbProps) {
	const isVideoFile = pf.file.type.startsWith("video/");

	const handleRemove = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onRemove(pf.id);
		},
		[onRemove, pf.id],
	);

	const handleClick = useCallback(() => {
		if (!pf.uploading && !isVideoFile) onPreview(pf.preview);
	}, [onPreview, pf.preview, pf.uploading, isVideoFile]);

	return (
		<div
			className="relative shrink-0 group cursor-pointer"
			onClick={handleClick}
		>
			<div className="relative size-20 overflow-hidden rounded-xl border border-border/50">
				{isVideoFile ? (
					<video src={pf.preview} muted className="size-full object-cover" />
				) : (
					<img src={pf.preview} alt={pf.file.name} className="size-full object-cover" />
				)}

				{isVideoFile && !pf.uploading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/30">
						<div className="flex size-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
							<Play className="size-3.5 text-white fill-white" />
						</div>
					</div>
				)}

				{pf.uploading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40">
						<Loader2 className="size-4 animate-spin text-white" />
					</div>
				)}
				{pf.error && (
					<div className="absolute inset-0 flex items-center justify-center bg-destructive/40">
						<span className="text-[9px] text-white font-medium">Ошибка</span>
					</div>
				)}

				{pf.uploading && (
					<div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
						<div
							className="h-full bg-white transition-all duration-300"
							style={{ width: `${pf.progress}%` }}
						/>
					</div>
				)}
			</div>

			<button
				type="button"
				onClick={handleRemove}
				className="absolute -right-1.5 -top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-black/70 text-white/90 opacity-0 shadow-sm transition-all hover:bg-black/90 group-hover:opacity-100"
			>
				<X className="size-3" />
			</button>
		</div>
	);
});
