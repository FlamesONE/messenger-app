import { memo } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { AppDrawerConfirm } from "@/shared/ui/app-drawer";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/components/ui/dialog";
import { Button } from "@/shared/ui/components/ui/button";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
	onConfirm: () => void;
}

export const ConfirmDialog = memo(function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Подтвердить",
	cancelLabel = "Отмена",
	variant = "default",
	onConfirm,
}: ConfirmDialogProps) {
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						{description && <DialogDescription>{description}</DialogDescription>}
					</DialogHeader>
					<DialogFooter>
						<Button variant="ghost" onClick={() => onOpenChange(false)}>
							{cancelLabel}
						</Button>
						<Button variant={variant} onClick={onConfirm}>
							{confirmLabel}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<AppDrawerConfirm
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
			confirmLabel={confirmLabel}
			cancelLabel={cancelLabel}
			variant={variant}
			onConfirm={onConfirm}
		/>
	);
});
