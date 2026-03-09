import { Upload } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/lib/utils";

interface DropZoneOverlayProps {
	active: boolean;
}

export const DropZoneOverlay = memo(function DropZoneOverlay({ active }: DropZoneOverlayProps) {
	return (
		<div
			className={cn(
				"absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200",
				active
					? "opacity-100"
					: "pointer-events-none opacity-0",
			)}
			style={{
				position: "absolute",
			}}
		>
			<div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-surface-elevated/50 px-12 py-10">
				<div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
					<Upload className="size-6 text-primary" />
				</div>
				<div className="text-center">
					<p className="text-sm font-semibold text-foreground">Перетащите файлы сюда</p>
					<p className="mt-1 text-xs text-surface-muted">Изображения, документы до 10 МБ</p>
				</div>
			</div>
		</div>
	);
});
