import { Search, X } from "lucide-react";
import { type ChangeEvent, memo, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { Tip } from "@/shared/ui/tip";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/shared/ui/components/ui/input-group";

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
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
		[onChange],
	);
	const handleClear = useCallback(() => onChange(""), [onChange]);

	return (
		<InputGroup className={cn("h-9 rounded-full", className)}>
			<InputGroupAddon align="inline-start">
				<Search className="size-4" />
			</InputGroupAddon>
			<InputGroupInput value={value} onChange={handleChange} placeholder={placeholder} />
			{value && (
				<InputGroupAddon align="inline-end">
					<Tip label="Очистить">
						<Button variant="ghost" size="icon-xs" onClick={handleClear}>
							<X className="size-3.5" />
						</Button>
					</Tip>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
});
