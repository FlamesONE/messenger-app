import { LogOut, Menu, Settings, SquarePen } from "lucide-react";
import { useCallback, useState } from "react";
import { useAuthStore } from "@/entities/user";
import { ChatList } from "@/features/chat-list/ChatList";
import { NewChatDialog } from "@/features/new-chat/NewChatDialog";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { SearchInput } from "@/shared/ui/search-input";

export function Sidebar() {
	const user = useAuthStore((s) => s.user);
	const logout = useAuthStore((s) => s.logout);
	const [newChatOpen, setNewChatOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = useCallback(() => {
		setMenuOpen(false);
		logout();
	}, [logout]);

	return (
		<div className="relative flex h-full w-80 shrink-0 flex-col border-r border-border bg-card">
			{/* Header */}
			<div className="flex h-14 shrink-0 items-center gap-2 px-3">
				<div className="relative">
					<button
						type="button"
						onClick={() => setMenuOpen((v) => !v)}
						className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
					>
						<Menu className="size-5" />
					</button>

					{/* Dropdown menu */}
					{menuOpen && (
						<>
							{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay */}
							<div
								role="presentation"
								className="fixed inset-0 z-40"
								onClick={() => setMenuOpen(false)}
								onKeyDown={() => setMenuOpen(false)}
							/>
							<div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl bg-popover p-1.5 shadow-lg ring-1 ring-border animate-in fade-in zoom-in-95">
								<div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
									<ChatAvatar name={user?.displayName || "?"} size="sm" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">{user?.displayName}</p>
										<p className="truncate text-xs text-muted-foreground">@{user?.username}</p>
									</div>
								</div>
								<div className="my-1 h-px bg-border" />
								<button
									type="button"
									className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
								>
									<Settings className="size-4 text-muted-foreground" />
									Настройки
								</button>
								<button
									type="button"
									onClick={handleLogout}
									className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
								>
									<LogOut className="size-4" />
									Выйти
								</button>
							</div>
						</>
					)}
				</div>

				<SearchInput value={searchQuery} onChange={setSearchQuery} className="flex-1" />
			</div>

			{/* Chat list */}
			<div className="flex-1 overflow-y-auto">
				<ChatList searchQuery={searchQuery} />
			</div>

			{/* FAB */}
			<button
				type="button"
				onClick={() => setNewChatOpen(true)}
				className="absolute bottom-5 right-5 z-10 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl active:scale-95"
				title="Новый чат"
			>
				<SquarePen className="size-5" />
			</button>

			<NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
		</div>
	);
}
