import { ChevronRight, UserRound, UsersRound } from "lucide-react";

export type NewChatStep = "choose" | "personal" | "group";

interface ChooseStepProps {
	onChoose: (step: NewChatStep) => void;
}

export function ChooseStep({ onChoose }: ChooseStepProps) {
	return (
		<div className="flex flex-col gap-2">
			<button
				type="button"
				onClick={() => onChoose("personal")}
				className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
			>
				<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-105">
					<UserRound className="size-[18px]" />
				</div>
				<div className="flex-1 text-left">
					<p className="text-[13px] font-semibold leading-tight">Личное сообщение</p>
					<p className="mt-0.5 text-[11px] text-muted-foreground/70">Написать напрямую</p>
				</div>
				<ChevronRight className="size-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
			</button>

			<button
				type="button"
				onClick={() => onChoose("group")}
				className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
			>
				<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-105">
					<UsersRound className="size-[18px]" />
				</div>
				<div className="flex-1 text-left">
					<p className="text-[13px] font-semibold leading-tight">Новая группа</p>
					<p className="mt-0.5 text-[11px] text-muted-foreground/70">Создать групповой чат</p>
				</div>
				<ChevronRight className="size-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
			</button>
		</div>
	);
}
