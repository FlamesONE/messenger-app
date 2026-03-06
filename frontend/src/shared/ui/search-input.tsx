import { Search, X } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/lib/utils";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export const SearchInput = memo(function SearchInput({
	value,
	onChange,
	placeholder = "Поиск",
	className,
}: SearchInputProps) {
	return (
		<div className={cn("relative", className)}>
			<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-9 w-full rounded-xl bg-secondary pl-9 pr-8 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-shadow"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
				>
					<X className="size-3.5" />
				</button>
			)}
		</div>
	);
});
