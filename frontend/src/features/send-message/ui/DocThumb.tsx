import { FileText, X } from "lucide-react";
import { memo, useCallback } from "react";
import type { PendingFile } from "../model/types";

interface DocThumbProps {
	file: PendingFile;
	onRemove: (id: string) => void;
}

export const DocThumb = memo(function DocThumb({ file: pf, onRemove }: DocThumbProps) {
	const handleRemove = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onRemove(pf.id);
		},
		[onRemove, pf.id],
	);

	return (
		<div className="relative shrink-0 group">
			<div className="flex h-20 w-36 flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-elevated gap-1 px-2">
				<FileText className="size-5 text-muted-foreground" />
				<span className="max-w-full truncate text-[10px] font-medium text-foreground">
					{pf.file.name}
				</span>
				{pf.uploading ? (
					<div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full bg-primary transition-all duration-300"
							style={{ width: `${pf.progress}%` }}
						/>
					</div>
				) : pf.error ? (
					<span className="text-[9px] text-destructive">Ошибка</span>
				) : null}
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
