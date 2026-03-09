import { Download, FileText, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MediaAttachment } from "@/entities/message";
import { formatFileSize } from "@/shared/lib/format-date";
import { cn } from "@/shared/lib/utils";
import { Lightbox } from "@/shared/ui/lightbox";

function isImage(m: MediaAttachment) { return m.type.startsWith("image/"); }
function isVideo(m: MediaAttachment) { return m.type.startsWith("video/"); }
function isAudio(m: MediaAttachment) { return m.type.startsWith("audio/"); }
function isVisual(m: MediaAttachment) { return isImage(m) || isVideo(m); }

interface MediaGridProps {
	media: MediaAttachment[];
	isMine: boolean;
	hasText: boolean;
}

export const MediaGrid = memo(function MediaGrid({ media, isMine, hasText }: MediaGridProps) {
	const [lightboxIndex, setLightboxIndex] = useState(-1);

	const visuals = useMemo(() => media.filter(isVisual), [media]);
	const audios = useMemo(() => media.filter(isAudio), [media]);
	const files = useMemo(() => media.filter((m) => !isVisual(m) && !isAudio(m)), [media]);

	const handleOpenLightbox = useCallback((idx: number) => {
		setLightboxIndex(idx);
	}, []);

	const handleCloseLightbox = useCallback(() => {
		setLightboxIndex(-1);
	}, []);

	return (
		<>
			{visuals.length > 0 && (
				<div className={cn(hasText ? "mb-1.5" : "")}>
					<VisualGrid visuals={visuals} hasText={hasText} onItemClick={handleOpenLightbox} />
				</div>
			)}

			{audios.length > 0 && (
				<div className={cn(
					"flex flex-col gap-1.5",
					hasText || visuals.length > 0 ? "mt-1.5" : "",
					hasText && visuals.length === 0 ? "mb-1.5" : "",
				)}>
					{audios.map((a) => (
						<AudioPlayer key={a.key || a.url} audio={a} isMine={isMine} />
					))}
				</div>
			)}

			{files.length > 0 && (
				<div className={cn(
					"flex flex-col gap-1",
					hasText && visuals.length === 0 && audios.length === 0 ? "mb-1.5" : "",
					visuals.length > 0 || audios.length > 0 ? "mt-1" : "",
				)}>
					{files.map((f) => (
						<FileAttachment key={f.key || f.url} file={f} isMine={isMine} hasText={hasText} />
					))}
				</div>
			)}

			<Lightbox
				media={visuals}
				initialIndex={lightboxIndex}
				open={lightboxIndex >= 0}
				onClose={handleCloseLightbox}
			/>
		</>
	);
});

/* ═══════════════════════════════════════════════════════════
   Visual grid (images + videos together)
   ═══════════════════════════════════════════════════════════ */

interface VisualGridProps {
	visuals: MediaAttachment[];
	hasText: boolean;
	onItemClick: (index: number) => void;
}

const GAP = 2;

const VisualGrid = memo(function VisualGrid({ visuals, hasText, onItemClick }: VisualGridProps) {
	const count = visuals.length;
	const rounding = hasText ? "rounded-lg" : "";

	if (count === 1) {
		return (
			<VisualCell
				item={visuals[0]}
				onClick={() => onItemClick(0)}
				className={cn("w-full overflow-hidden", rounding)}
				aspect="auto"
				maxH
			/>
		);
	}

	if (count === 2) {
		return (
			<div className={cn("grid grid-cols-2 overflow-hidden", rounding)} style={{ gap: GAP }}>
				<VisualCell item={visuals[0]} onClick={() => onItemClick(0)} aspect="4/3" />
				<VisualCell item={visuals[1]} onClick={() => onItemClick(1)} aspect="4/3" />
			</div>
		);
	}

	if (count === 3) {
		return (
			<div className={cn("grid grid-cols-2 grid-rows-2 overflow-hidden", rounding)} style={{ gap: GAP }}>
				<div className="row-span-2">
					<VisualCell item={visuals[0]} onClick={() => onItemClick(0)} className="h-full" />
				</div>
				<VisualCell item={visuals[1]} onClick={() => onItemClick(1)} aspect="4/3" />
				<VisualCell item={visuals[2]} onClick={() => onItemClick(2)} aspect="4/3" />
			</div>
		);
	}

	if (count === 4) {
		return (
			<div className={cn("grid grid-cols-2 overflow-hidden", rounding)} style={{ gap: GAP }}>
				{visuals.map((v, i) => (
					<VisualCell key={v.key || v.url} item={v} onClick={() => onItemClick(i)} aspect="4/3" />
				))}
			</div>
		);
	}

	const extraCount = count - 5;
	return (
		<div className={cn("grid grid-cols-6 overflow-hidden", rounding)} style={{ gap: GAP }}>
			<div className="col-span-3"><VisualCell item={visuals[0]} onClick={() => onItemClick(0)} aspect="4/3" /></div>
			<div className="col-span-3"><VisualCell item={visuals[1]} onClick={() => onItemClick(1)} aspect="4/3" /></div>
			<div className="col-span-2"><VisualCell item={visuals[2]} onClick={() => onItemClick(2)} aspect="1/1" /></div>
			<div className="col-span-2"><VisualCell item={visuals[3]} onClick={() => onItemClick(3)} aspect="1/1" /></div>
			<div className="relative col-span-2">
				<VisualCell item={visuals[4]} onClick={() => onItemClick(4)} aspect="1/1" />
				{extraCount > 0 && (
					<button
						type="button"
						onClick={() => onItemClick(4)}
						className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-semibold text-lg transition-colors hover:bg-black/60"
					>
						+{extraCount}
					</button>
				)}
			</div>
		</div>
	);
});

/* ─── Visual cell (image or video thumbnail) ─────────── */

interface VisualCellProps {
	item: MediaAttachment;
	onClick: () => void;
	className?: string;
	aspect?: string;
	maxH?: boolean;
}

const VisualCell = memo(function VisualCell({ item, onClick, className, aspect, maxH }: VisualCellProps) {
	const isVid = isVideo(item);
	// For single images (aspect="auto"), use 4/3 fallback to prevent layout shift
	const resolvedAspect = aspect === "auto" ? "4/3" : aspect;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn("relative w-full overflow-hidden transition-opacity hover:opacity-[0.92] group/vc", className)}
			style={resolvedAspect ? { aspectRatio: resolvedAspect } : undefined}
		>
			{isVid ? (
				<video
					src={item.url}
					muted
					preload="metadata"
					className={cn("size-full object-cover", maxH && "max-h-80")}
				/>
			) : (
				<img
					src={item.url}
					alt={item.name}
					className={cn("size-full object-cover", maxH && "max-h-80")}
				/>
			)}

			{isVid && (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex size-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-transform group-hover/vc:scale-110">
						<Play className="size-5 text-white fill-white ml-0.5" />
					</div>
				</div>
			)}
		</button>
	);
});

/* ═══════════════════════════════════════════════════════════
   Custom audio player with real waveform from Web Audio API
   ═══════════════════════════════════════════════════════════ */

interface AudioPlayerProps {
	audio: MediaAttachment;
	isMine: boolean;
}

function formatDuration(sec: number): string {
	if (!Number.isFinite(sec) || sec < 0) return "0:00";
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

const BAR_COUNT = 48;
const SPEEDS = [1, 1.5, 2] as const;

const waveformCache = new Map<string, number[]>();

function extractPeaks(buffer: AudioBuffer, bars: number): number[] {
	const data = buffer.getChannelData(0);
	const blockSize = Math.floor(data.length / bars);
	const peaks: number[] = [];
	let max = 0;

	for (let i = 0; i < bars; i++) {
		let sum = 0;
		const start = i * blockSize;
		const end = Math.min(start + blockSize, data.length);
		for (let j = start; j < end; j++) {
			sum += Math.abs(data[j]);
		}
		const avg = sum / (end - start);
		peaks.push(avg);
		if (avg > max) max = avg;
	}

	if (max > 0) {
		for (let i = 0; i < peaks.length; i++) peaks[i] /= max;
	}
	return peaks;
}

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
	if (!audioCtx) audioCtx = new AudioContext();
	return audioCtx;
}

async function fetchWaveform(url: string): Promise<number[]> {
	const cached = waveformCache.get(url);
	if (cached) return cached;

	try {
		const resp = await fetch(url);
		const arrayBuf = await resp.arrayBuffer();
		const ctx = getAudioContext();
		const decoded = await ctx.decodeAudioData(arrayBuf);
		const peaks = extractPeaks(decoded, BAR_COUNT);
		waveformCache.set(url, peaks);
		return peaks;
	} catch {
		const fallback = Array.from({ length: BAR_COUNT }, () => 0.15 + Math.random() * 0.85);
		waveformCache.set(url, fallback);
		return fallback;
	}
}

const AudioPlayer = memo(function AudioPlayer({ audio, isMine }: AudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const waveRef = useRef<HTMLDivElement>(null);
	const dragging = useRef(false);

	const [playing, setPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [peaks, setPeaks] = useState<number[]>(() => waveformCache.get(audio.url) ?? []);
	const [speedIdx, setSpeedIdx] = useState(0);
	const [muted, setMuted] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetchWaveform(audio.url).then((p) => { if (!cancelled) setPeaks(p); });
		return () => { cancelled = true; };
	}, [audio.url]);

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;

		const onLoaded = () => { if (el.duration && Number.isFinite(el.duration)) setDuration(el.duration); };
		const onTime = () => setCurrentTime(el.currentTime);
		const onEnded = () => { setPlaying(false); setCurrentTime(0); };
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);

		el.addEventListener("loadedmetadata", onLoaded);
		el.addEventListener("durationchange", onLoaded);
		el.addEventListener("timeupdate", onTime);
		el.addEventListener("ended", onEnded);
		el.addEventListener("play", onPlay);
		el.addEventListener("pause", onPause);

		return () => {
			el.removeEventListener("loadedmetadata", onLoaded);
			el.removeEventListener("durationchange", onLoaded);
			el.removeEventListener("timeupdate", onTime);
			el.removeEventListener("ended", onEnded);
			el.removeEventListener("play", onPlay);
			el.removeEventListener("pause", onPause);
		};
	}, []);

	const togglePlay = useCallback(() => {
		const el = audioRef.current;
		if (!el) return;
		if (el.paused) el.play();
		else el.pause();
	}, []);

	const seekTo = useCallback((clientX: number) => {
		const el = audioRef.current;
		const bar = waveRef.current;
		if (!el || !bar || !duration) return;
		const rect = bar.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		el.currentTime = ratio * duration;
	}, [duration]);

	const handlePointerDown = useCallback((e: React.PointerEvent) => {
		dragging.current = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		seekTo(e.clientX);
	}, [seekTo]);

	const handlePointerMove = useCallback((e: React.PointerEvent) => {
		if (dragging.current) seekTo(e.clientX);
	}, [seekTo]);

	const handlePointerUp = useCallback(() => {
		dragging.current = false;
	}, []);

	const cycleSpeed = useCallback(() => {
		setSpeedIdx((prev) => {
			const next = (prev + 1) % SPEEDS.length;
			if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
			return next;
		});
	}, []);

	const toggleMute = useCallback(() => {
		setMuted((m) => {
			if (audioRef.current) audioRef.current.muted = !m;
			return !m;
		});
	}, []);

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	const speed = SPEEDS[speedIdx];

	return (
		<div className={cn(
			"flex items-center gap-2 rounded-2xl px-3 py-2.5",
			isMine ? "bg-white/[0.08]" : "bg-black/[0.04] dark:bg-white/[0.06]",
		)}>
			<audio ref={audioRef} src={audio.url} preload="metadata" />

			<button
				type="button"
				onClick={togglePlay}
				className={cn(
					"flex size-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95",
					isMine
						? "bg-white/20 text-white hover:bg-white/30"
						: "bg-primary/10 text-primary hover:bg-primary/20",
				)}
			>
				{playing ? (
					<Pause className="size-[18px] fill-current" />
				) : (
					<Play className="size-[18px] fill-current ml-0.5" />
				)}
			</button>

			<div className="flex-1 min-w-0 space-y-0.5">
				<div
					ref={waveRef}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					className="relative h-8 cursor-pointer flex items-center gap-[1px] touch-none select-none"
				>
					{peaks.length > 0 ? peaks.map((h, i) => {
						const pct = ((i + 0.5) / peaks.length) * 100;
						const active = pct <= progress;
						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static waveform
								key={i}
								className="flex-1 self-stretch flex items-center"
							>
								<div
									className={cn(
										"w-full rounded-full transition-colors duration-100",
										active
											? isMine ? "bg-white" : "bg-primary"
											: isMine ? "bg-white/20" : "bg-primary/20",
									)}
									style={{ height: `${Math.max(8, h * 100)}%` }}
								/>
							</div>
						);
					}) : Array.from({ length: BAR_COUNT }, (_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: placeholder bars
							key={i}
							className="flex-1 self-stretch flex items-center"
						>
							<div
								className={cn(
									"w-full rounded-full",
									isMine ? "bg-white/10" : "bg-primary/10",
								)}
								style={{ height: "15%" }}
							/>
						</div>
					))}
				</div>

				<div className="flex items-center justify-between px-0.5">
					<span className={cn(
						"text-[10px] tabular-nums",
						isMine ? "text-white/50" : "text-muted-foreground/60",
					)}>
						{playing || currentTime > 0 ? formatDuration(currentTime) : formatDuration(duration)}
					</span>

					<div className="flex items-center gap-1.5">
						{playing && speed !== 1 && (
							<span className={cn(
								"text-[9px] font-bold tabular-nums",
								isMine ? "text-white/40" : "text-muted-foreground/40",
							)}>
								{speed}x
							</span>
						)}
						<button
							type="button"
							onClick={toggleMute}
							className={cn(
								"flex size-5 items-center justify-center rounded-full transition-colors",
								isMine ? "text-white/40 hover:text-white/70" : "text-muted-foreground/40 hover:text-muted-foreground/70",
							)}
						>
							{muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
						</button>
						<button
							type="button"
							onClick={cycleSpeed}
							className={cn(
								"rounded-md px-1 py-0.5 text-[9px] font-bold tabular-nums transition-colors",
								isMine
									? "text-white/50 hover:bg-white/10 hover:text-white/80"
									: "text-muted-foreground/50 hover:bg-primary/10 hover:text-primary",
							)}
						>
							{speed}x
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});

/* ═══════════════════════════════════════════════════════════
   File attachment
   ═══════════════════════════════════════════════════════════ */

interface FileAttachmentProps {
	file: MediaAttachment;
	isMine: boolean;
	hasText: boolean;
}

const FileAttachment = memo(function FileAttachment({ file, isMine, hasText }: FileAttachmentProps) {
	return (
		<a
			href={file.url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"flex items-center gap-2.5 rounded-lg p-2.5 text-xs transition-colors",
				isMine
					? "bg-white/10 hover:bg-white/15"
					: "bg-black/[0.04] hover:bg-black/[0.07]",
				!hasText && "mx-2 my-2",
			)}
		>
			<div className={cn(
				"flex size-9 shrink-0 items-center justify-center rounded-lg",
				isMine ? "bg-white/15" : "bg-primary/10",
			)}>
				<FileText className={cn("size-4", isMine ? "text-white/80" : "text-primary")} />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium">{file.name}</p>
				<p className={cn("text-[10px]", isMine ? "text-white/50" : "text-muted-foreground/60")}>
					{formatFileSize(file.size)}
				</p>
			</div>
			<Download className={cn("size-4 shrink-0", isMine ? "text-white/40" : "text-muted-foreground/40")} />
		</a>
	);
});
