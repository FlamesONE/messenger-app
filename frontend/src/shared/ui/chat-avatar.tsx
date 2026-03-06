import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/ui/avatar";

const COLORS = [
	"bg-red-500/80",
	"bg-orange-500/80",
	"bg-amber-500/80",
	"bg-emerald-500/80",
	"bg-teal-500/80",
	"bg-cyan-500/80",
	"bg-blue-500/80",
	"bg-indigo-500/80",
	"bg-violet-500/80",
	"bg-pink-500/80",
];

function hashColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

interface ChatAvatarProps {
	name: string;
	avatarUrl?: string | null;
	size?: "sm" | "default" | "lg";
	online?: boolean;
}

export const ChatAvatar = memo(function ChatAvatar({
	name,
	avatarUrl,
	size = "default",
	online,
}: ChatAvatarProps) {
	const color = hashColor(name);
	const initials = getInitials(name || "?");

	return (
		<div className="relative">
			<Avatar size={size}>
				{avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
				<AvatarFallback className={`${color} text-white font-medium`}>{initials}</AvatarFallback>
			</Avatar>
			{online && (
				<span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
			)}
		</div>
	);
});
