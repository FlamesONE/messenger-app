import { ChevronLeft, ChevronRight, Download, Maximize, X } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

export interface LightboxMedia {
	url: string;
	name: string;
	type: string;
}

interface LightboxProps {
	media: LightboxMedia[];
	initialIndex: number;
	open: boolean;
	onClose: () => void;
}

export const Lightbox = memo(function Lightbox({
	media,
	initialIndex,
	open,
	onClose,
}: LightboxProps) {
	const [index, setIndex] = useState(initialIndex);
	const [zoomed, setZoomed] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (open) {
			setIndex(initialIndex);
			setZoomed(false);
		}
	}, [open, initialIndex]);

	useEffect(() => {
		if (!open) return;

		const onKey = (e: KeyboardEvent) => {
			switch (e.key) {
				case "Escape":
					onClose();
					break;
				case "ArrowLeft":
					setIndex((i) => (i > 0 ? i - 1 : i));
					setZoomed(false);
					break;
				case "ArrowRight":
					setIndex((i) => (i < media.length - 1 ? i + 1 : i));
					setZoomed(false);
					break;
				case "f":
				case "F":
					if (videoRef.current) videoRef.current.requestFullscreen?.();
					break;
			}
		};

		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, media.length, onClose]);

	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	const handlePrev = useCallback(() => {
		setIndex((i) => Math.max(0, i - 1));
		setZoomed(false);
	}, []);

	const handleNext = useCallback(() => {
		setIndex((i) => Math.min(media.length - 1, i + 1));
		setZoomed(false);
	}, [media.length]);

	const handleToggleZoom = useCallback(() => {
		setZoomed((z) => !z);
	}, []);

	const handleBackdropClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget) {
				if (zoomed) setZoomed(false);
				else onClose();
			}
		},
		[onClose, zoomed],
	);

	const handleFullscreen = useCallback(() => {
		videoRef.current?.requestFullscreen?.();
	}, []);

	const safeIndex = Math.max(0, Math.min(index, media.length - 1));
	const current = media[safeIndex];

	if (!open || media.length === 0 || !current) return null;

	const hasPrev = safeIndex > 0;
	const hasNext = safeIndex < media.length - 1;
	const isVideo = current.type.startsWith("video/");

	return createPortal(
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
			onClick={handleBackdropClick}
		>
			{/* Top bar */}
			<div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
				<div className="flex items-center gap-3 min-w-0">
					{media.length > 1 && (
						<span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm">
							{safeIndex + 1} / {media.length}
						</span>
					)}
					<span className="truncate text-[13px] text-white/60">
						{current.name}
					</span>
				</div>
				<div className="flex items-center gap-1">
					{isVideo && (
						<button
							type="button"
							onClick={handleFullscreen}
							className="flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
							title="Полный экран (F)"
						>
							<Maximize className="size-4" />
						</button>
					)}
					<a
						href={current.url}
						download={current.name}
						className="flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
						onClick={(e) => e.stopPropagation()}
					>
						<Download className="size-4" />
					</a>
					<button
						type="button"
						onClick={onClose}
						className="flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
					>
						<X className="size-5" />
					</button>
				</div>
			</div>

			{/* Navigation */}
			{hasPrev && (
				<button
					type="button"
					onClick={handlePrev}
					className="absolute left-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white hover:scale-110"
				>
					<ChevronLeft className="size-5" />
				</button>
			)}
			{hasNext && (
				<button
					type="button"
					onClick={handleNext}
					className="absolute right-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white hover:scale-110"
				>
					<ChevronRight className="size-5" />
				</button>
			)}

			{/* Content */}
			{isVideo ? (
				<video
					ref={videoRef}
					key={current.url}
					src={current.url}
					controls
					autoPlay
					className="max-h-[85vh] max-w-[90vw] rounded-lg outline-none"
					onClick={(e) => e.stopPropagation()}
				>
					<track kind="captions" />
				</video>
			) : (
				<img
					src={current.url}
					alt={current.name}
					onClick={handleToggleZoom}
					className={cn(
						"select-none transition-transform duration-300",
						zoomed
							? "max-h-none max-w-none cursor-zoom-out"
							: "max-h-[85vh] max-w-[90vw] cursor-zoom-in rounded-lg object-contain",
					)}
					draggable={false}
				/>
			)}
		</div>,
		document.body,
	);
});
