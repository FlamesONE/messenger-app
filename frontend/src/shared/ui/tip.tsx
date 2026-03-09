import type { ReactNode } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/components/ui/tooltip";

interface TipProps {
	label: string;
	side?: "top" | "bottom" | "left" | "right";
	children: ReactNode;
	asChild?: boolean;
}

/** Compact tooltip wrapper. Usage: <Tip label="Текст">…</Tip> */
export function Tip({ label, side = "top", children, asChild = true }: TipProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
			<TooltipContent side={side} sideOffset={6}>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}
