const chatItems = [0.92, 0.7, 0.85, 0.6, 0.78, 0.55, 0.88, 0.65];
const bubbles = [
	{ align: "start", w: "w-52", h: "h-10" },
	{ align: "start", w: "w-72", h: "h-16" },
	{ align: "end", w: "w-44", h: "h-10" },
	{ align: "end", w: "w-60", h: "h-10" },
	{ align: "start", w: "w-40", h: "h-10" },
	{ align: "end", w: "w-80", h: "h-20" },
	{ align: "start", w: "w-56", h: "h-10" },
	{ align: "start", w: "w-36", h: "h-10" },
];

export function MessengerSkeleton() {
	return (
		<div className="flex h-screen bg-background max-lg:p-0 lg:p-3 gap-0">
			{/* Sidebar skeleton */}
			<div className="panel-surface hidden lg:flex w-[300px] shrink-0 flex-col rounded-2xl">
				<div className="flex items-center gap-2 px-3 pt-3 pb-2">
					<div className="size-8 rounded-full skeleton-shimmer" />
					<div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
					<div className="size-8 rounded-full skeleton-shimmer" />
				</div>
				<div className="flex gap-1 px-3 py-1.5">
					<div className="h-7 w-16 rounded-lg skeleton-shimmer" />
					<div className="h-7 w-20 rounded-lg skeleton-shimmer" />
					<div className="h-7 w-18 rounded-lg skeleton-shimmer" />
				</div>
				<div className="flex-1 flex flex-col gap-0.5 px-2 py-1">
					{chatItems.map((nameW, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							key={i}
							className="flex items-center gap-3 rounded-xl px-2.5 py-2.5"
							style={{ animationDelay: `${i * 80}ms` }}
						>
							<div className="size-10 shrink-0 rounded-full skeleton-shimmer" />
							<div className="flex-1 min-w-0 space-y-2">
								<div
									className="h-3.5 rounded-md skeleton-shimmer"
									style={{ width: `${nameW * 60}%` }}
								/>
								<div
									className="h-3 rounded-md skeleton-shimmer"
									style={{ width: `${nameW * 85}%` }}
								/>
							</div>
						</div>
					))}
				</div>
				<div className="flex items-center gap-2.5 px-3.5 py-3">
					<div className="size-9 rounded-full skeleton-shimmer" />
					<div className="flex-1 space-y-1.5">
						<div className="h-3.5 w-24 rounded-md skeleton-shimmer" />
						<div className="h-2.5 w-14 rounded-md skeleton-shimmer" />
					</div>
				</div>
			</div>
			{/* Chat area skeleton */}
			<div className="chat-surface flex-1 flex flex-col lg:rounded-r-2xl">
				<div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
					<div className="size-10 rounded-full skeleton-shimmer" />
					<div className="flex-1 space-y-2">
						<div className="h-4 w-32 rounded-md skeleton-shimmer" />
						<div className="h-3 w-20 rounded-md skeleton-shimmer" />
					</div>
				</div>
				<div className="flex-1 flex flex-col justify-end gap-2.5 p-4 overflow-hidden">
					{bubbles.map((b, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							key={i}
							className={`flex ${b.align === "end" ? "justify-end" : "justify-start"}`}
							style={{ animationDelay: `${i * 60}ms` }}
						>
							<div
								className={`${b.w} ${b.h} rounded-2xl skeleton-shimmer ${
									b.align === "end" ? "rounded-br-sm" : "rounded-bl-sm"
								}`}
							/>
						</div>
					))}
				</div>
				<div className="px-4 pb-4 pt-1">
					<div className="h-12 rounded-2xl skeleton-shimmer" />
				</div>
			</div>
		</div>
	);
}
