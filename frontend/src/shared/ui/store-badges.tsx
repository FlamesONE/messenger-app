interface StoreBadgesProps {
	variant: "dark" | "light";
}

export function StoreBadges({ variant }: StoreBadgesProps) {
	const isDark = variant === "dark";
	const badgeBg = isDark ? "bg-white/[0.08] hover:bg-white/[0.14]" : "bg-[#111] hover:bg-[#222]";
	const badgeBorder = isDark ? "border-white/[0.12]" : "border-[#111]";
	const textColor = isDark ? "text-white" : "text-white";
	const subtextColor = isDark ? "text-white/60" : "text-white/70";
	const iconFill = isDark ? "fill-white" : "fill-white";

	return (
		<div className="flex flex-wrap items-center justify-center gap-2.5">
			<a
				href="#"
				className={`flex h-11 items-center gap-2 rounded-[10px] border ${badgeBorder} ${badgeBg} px-3.5 transition-colors`}
			>
				<svg viewBox="0 0 24 24" className={`size-5 shrink-0 ${iconFill}`}>
					<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
				</svg>
				<div className="text-left">
					<p className={`text-[8px] leading-none ${subtextColor}`}>Download on the</p>
					<p className={`mt-px text-[14px] font-semibold leading-tight ${textColor}`}>App Store</p>
				</div>
			</a>

			<a
				href="#"
				className={`flex h-11 items-center gap-2 rounded-[10px] border ${badgeBorder} ${badgeBg} px-3.5 transition-colors`}
			>
				<svg viewBox="0 0 512 512" className={`size-5 shrink-0 ${iconFill}`}>
					<path d="M48 59.49v393a4.33 4.33 0 0 0 7.37 3.07L260 256 55.37 56.42A4.33 4.33 0 0 0 48 59.49zM345.8 174 89.22 32.64l-.16-.09c-4.42-2.4-8.62 3.58-5 7.06l201.13 192.32zm0 164L280.19 280.07 89.22 479.36l-.16.09c-3.62 3.48.58 9.46 5 7.06zm91.56-109.98c-5.46-3.14-42.8-24.57-42.8-24.57L341.63 256l52.93 52.55s37.34-21.43 42.8-24.57c6.52-3.93 6.52-10.03 0-13.96z" />
				</svg>
				<div className="text-left">
					<p className={`text-[8px] leading-none ${subtextColor}`}>GET IT ON</p>
					<p className={`mt-px text-[14px] font-semibold leading-tight ${textColor}`}>Google Play</p>
				</div>
			</a>
		</div>
	);
}
