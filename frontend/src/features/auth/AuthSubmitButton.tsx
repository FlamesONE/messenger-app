import { Loader2 } from "lucide-react";
import { memo, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
	label: string;
}

export const AuthSubmitButton = memo(function AuthSubmitButton({
	loading,
	label,
	className,
	...props
}: AuthSubmitButtonProps) {
	return (
		<button
			type="submit"
			disabled={loading}
			className={cn(
				"mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-foreground text-sm font-semibold tracking-wide text-background uppercase transition-all hover:opacity-85 disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{loading ? <Loader2 className="size-4 animate-spin" /> : label}
		</button>
	);
});
