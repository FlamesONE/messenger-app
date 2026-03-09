import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
	required?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
	function AuthInput({ label, error, required, className, id, ...props }, ref) {
		return (
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor={id}
					className="text-[13px] font-medium text-foreground/80"
				>
					{label}
					{required && "*"}
				</label>
				<input
					ref={ref}
					id={id}
					className={cn(
						"h-11 border-b-2 border-border/80 bg-transparent pb-1 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-foreground",
						error && "border-destructive focus:border-destructive",
						className,
					)}
					{...props}
				/>
				{error && <p className="text-xs text-destructive">{error}</p>}
			</div>
		);
	},
);
