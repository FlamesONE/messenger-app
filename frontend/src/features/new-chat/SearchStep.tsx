import { Loader2, Search } from "lucide-react";
import type { User as UserType } from "@/entities/user";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { Input } from "@/shared/ui/components/ui/input";

interface SearchStepProps {
	searchQuery: string;
	onSearchChange: (q: string) => void;
	isSearching: boolean;
	results: UserType[];
	placeholder: string;
	emptyHint: string;
	onSelect: (user: UserType) => void;
	compact?: boolean;
}

export function SearchStep({
	searchQuery,
	onSearchChange,
	isSearching,
	results,
	placeholder,
	emptyHint,
	onSelect,
	compact,
}: SearchStepProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
				<Input
					placeholder={placeholder}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9 rounded-xl"
					autoFocus={!compact}
				/>
			</div>

			<div className={`overflow-y-auto rounded-xl ${compact ? "max-h-48" : "max-h-72"}`}>
				{isSearching && searchQuery && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="size-5 animate-spin text-muted-foreground/40" />
					</div>
				)}

				{!isSearching && searchQuery && results.length === 0 && (
					<div className="py-8 text-center text-[13px] text-muted-foreground/60">
						Никого не найдено
					</div>
				)}

				{!searchQuery && (
					<div className="py-8 text-center text-[13px] text-muted-foreground/60">
						{emptyHint}
					</div>
				)}

				{results.map((user) => (
					<button
						key={user.id}
						type="button"
						onClick={() => onSelect(user)}
						className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/50"
					>
						<ChatAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="default" />
						<div className="min-w-0 flex-1 text-left">
							<p className="truncate text-[13px] font-medium leading-tight">{user.displayName}</p>
							<p className="truncate text-[11px] text-muted-foreground/60 mt-0.5">@{user.username}</p>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
