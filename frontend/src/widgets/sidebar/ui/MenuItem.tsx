import { Switch } from "@/shared/ui/components/ui/switch";

interface MenuItemProps {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	destructive?: boolean;
	checked?: boolean;
	onCheckedChange?: (value: boolean) => void;
}

export function MenuItem({
	icon,
	label,
	onClick,
	destructive,
	checked,
	onCheckedChange,
}: MenuItemProps) {
	const hasSwitch = checked !== undefined;

	const handleClick = () => {
		if (hasSwitch && onCheckedChange) {
			onCheckedChange(!checked);
		} else if (onClick) {
			onClick();
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
				destructive
					? "text-red-400 hover:bg-red-500/10"
					: "text-panel-foreground hover:bg-panel-secondary/60"
			}`}
		>
			<span className={destructive ? "text-red-400" : "text-panel-muted"}>{icon}</span>
			<span className="flex-1 text-left">{label}</span>
			{hasSwitch && (
				<Switch
					checked={checked}
					onCheckedChange={onCheckedChange}
					onClick={(e) => e.stopPropagation()}
				/>
			)}
		</button>
	);
}
