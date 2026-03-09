import { ArrowLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import { memo, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/ui/components/ui/drawer";

type DrawerSide = "right" | "bottom" | "left";
type DrawerVariant = "panel" | "surface" | "sidebar-normal";

const variantClasses: Record<DrawerVariant, string> = {
	panel: "panel-surface-portal",
	surface: "chat-surface-portal",
	"sidebar-normal": "sidebar-normal-portal",
};

interface AppDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	side?: DrawerSide;
	variant?: DrawerVariant;
	className?: string;
	children: ReactNode;
	footer?: ReactNode;
	onBack?: () => void;
	headerRight?: ReactNode;
}

export const AppDrawer = memo(function AppDrawer({
	open,
	onOpenChange,
	title,
	description,
	side = "right",
	variant = "panel",
	className,
	children,
	footer,
	onBack,
	headerRight,
}: AppDrawerProps) {
	const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

	return (
		<Drawer direction={side} open={open} onOpenChange={onOpenChange}>
			<DrawerContent
				className={cn(
					"flex flex-col text-sm outline-none",
					variantClasses[variant],
					side === "right" && "h-full w-[min(400px,88vw)] rounded-l-2xl rounded-r-none border-l border-r-0",
					side === "left" && "h-full w-[min(400px,88vw)] rounded-l-none rounded-r-2xl border-r border-l-0",
					side === "bottom" && "max-h-[85vh] rounded-t-2xl",
					className,
				)}
			>
				<DrawerHeader className="flex flex-row items-center gap-2 border-b border-border/60 px-4 py-3">
					{onBack && (
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onBack}
							className="shrink-0 rounded-lg -ml-1"
						>
							<ArrowLeft className="size-4" />
						</Button>
					)}
					<div className="flex-1 min-w-0">
						<DrawerTitle className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
							{title}
						</DrawerTitle>
						{description && (
							<DrawerDescription className="mt-0.5 text-[11px] text-muted-foreground/70">
								{description}
							</DrawerDescription>
						)}
					</div>
					{headerRight}
					<DrawerClose asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={handleClose}
							className="shrink-0 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
						>
							<X className="size-4" />
						</Button>
					</DrawerClose>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto px-4 py-4">
					{children}
				</div>

				{footer && (
					<DrawerFooter className="border-t border-border/60 px-4 py-3">
						{footer}
					</DrawerFooter>
				)}
			</DrawerContent>
		</Drawer>
	);
});

interface AppDrawerConfirmProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
	onConfirm: () => void;
}

export const AppDrawerConfirm = memo(function AppDrawerConfirm({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Подтвердить",
	cancelLabel = "Отмена",
	variant = "default",
	onConfirm,
}: AppDrawerConfirmProps) {
	return (
		<AppDrawer
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			side="bottom"
			variant="panel"
		>
			<div className="flex flex-col gap-4">
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
				<div className="flex gap-2 justify-end">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						{cancelLabel}
					</Button>
					<Button variant={variant} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</AppDrawer>
	);
});
