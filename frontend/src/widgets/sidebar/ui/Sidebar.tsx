import { useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Moon, Palette, Plus, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { memo, useCallback, useState } from "react";
import { useChats, useStartDm } from "@/entities/chat";
import type { User } from "@/entities/user";
import { useAuthStore, useSearchUsers } from "@/entities/user";
import { ChatList } from "@/features/chat-list/ChatList";
import { NewChatDialog } from "@/features/new-chat/NewChatDialog";
import { AppSettingsDialog } from "@/features/app-settings/AppSettingsDialog";
import { ProfileSettingsDialog } from "@/features/profile/ProfileSettingsDialog";
import { UserSearchResults } from "@/features/user-search/UserSearchResults";
import { useDebounce } from "@uidotdev/usehooks";
import { useSidebarSettings } from "@/shared/lib/sidebar-settings-store";
import { useWsStatus } from "@/features/ws";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { Button } from "@/shared/ui/components/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import { Tip } from "@/shared/ui/tip";
import { MenuItem } from "./MenuItem";
import { SidebarTabs, type SidebarTab } from "./SidebarTabs";

export const Sidebar = memo(function Sidebar() {
	const user = useAuthStore((s) => s.user);
	const logout = useAuthStore((s) => s.logout);
	const queryClient = useQueryClient();
	const [newChatOpen, setNewChatOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [appSettingsOpen, setAppSettingsOpen] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<SidebarTab>("all");
	const { theme, setTheme } = useTheme();
	const invertedPanel = useSidebarSettings((s) => s.invertedPanel);
	const setInvertedPanel = useSidebarSettings((s) => s.setInvertedPanel);

	const wsStatus = useWsStatus((s) => s.status);
	const isMeOnline = wsStatus === "connected";
	const { data: chats = [] } = useChats();
	const startDm = useStartDm(chats);

	const isUserSearch = searchQuery.startsWith("@") || searchQuery.length >= 2;
	const userSearchQuery = searchQuery.startsWith("@") ? searchQuery.slice(1) : searchQuery;
	const debouncedUserSearch = useDebounce(isUserSearch ? userSearchQuery : "", 300);
	const { data: searchedUsers = [], isLoading: isSearchingUsers } = useSearchUsers(
		debouncedUserSearch,
	);

	const filteredSearchUsers = searchedUsers.filter((u) => u.id !== user?.id);

	const showUserResults = isUserSearch && searchQuery.length >= 2;

	const handleLogout = useCallback(() => {
		queryClient.clear();
		logout();
	}, [logout, queryClient]);

	const handleOpenNewChat = useCallback(() => setNewChatOpen(true), []);
	const handleCloseNewChat = useCallback(() => setNewChatOpen(false), []);
	const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
	const handleCloseAppSettings = useCallback(() => setAppSettingsOpen(false), []);

	const handleStartChat = useCallback(
		(targetUser: User) => {
			startDm(targetUser);
			setSearchQuery("");
		},
		[startDm],
	);

	return (
		<div className={`${invertedPanel ? "panel-surface" : "sidebar-normal"} relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-2xl border-none lg:w-[300px]`}>
			<div className="flex shrink-0 items-center gap-2 px-3 pt-3 pb-1">
				<Tip label="Меню">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setDrawerOpen(true)}
						className="rounded-full text-panel-muted hover:text-panel-foreground hover:bg-panel-secondary"
					>
						<Menu className="size-5" />
					</Button>
				</Tip>

				<SearchInput
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Поиск чатов и @юзеров"
					className="flex-1"
				/>

				<Tip label="Новый чат">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleOpenNewChat}
						className="rounded-full text-panel-muted hover:text-panel-foreground hover:bg-panel-secondary"
					>
						<Plus className="size-5" />
					</Button>
				</Tip>
			</div>

			{showUserResults ? (
				<div className="flex-1 overflow-y-auto">
					<UserSearchResults
						users={filteredSearchUsers}
						isLoading={isSearchingUsers}
						onStartChat={handleStartChat}
					/>
				</div>
			) : (
				<>
					<SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

					<div className="flex-1 overflow-y-auto">
						<ChatList searchQuery={searchQuery} filterTab={activeTab} />
					</div>

					<button
						type="button"
						onClick={() => setSettingsOpen(true)}
						className="flex items-center gap-2.5 border-t border-panel-border px-3.5 py-3 transition-colors hover:bg-panel-secondary/60"
					>
						<ChatAvatar name={user?.displayName || "?"} avatarUrl={user?.avatarUrl} size="sm" online={isMeOnline} />
						<div className="flex-1 min-w-0 text-left">
							<span className="truncate text-sm font-semibold mr-2">{user?.displayName}</span>
							<span className={`text-[11px] ${isMeOnline ? "text-emerald-500" : "text-muted-foreground"}`}>
								{isMeOnline ? "В сети" : "Не в сети"}
							</span>
						</div>
						<Tip label="Настройки" side="left">
						<span><Settings className="size-4 text-panel-muted" /></span>
					</Tip>
					</button>
				</>
			)}

			<AppDrawer
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				title="Меню"
				side="left"
				variant={invertedPanel ? "panel" : "sidebar-normal"}
			>
				<div className="flex flex-col gap-1 -mt-1">
					<button
						type="button"
						onClick={() => { setSettingsOpen(true); setDrawerOpen(false); }}
						className="flex items-center gap-3 rounded-xl px-2.5 py-3 mb-1 transition-colors hover:bg-panel-secondary/60"
					>
						<ChatAvatar name={user?.displayName || "?"} avatarUrl={user?.avatarUrl} size="default" online={isMeOnline} />
						<div className="min-w-0 flex-1 text-left">
							<p className="truncate text-[13px] font-semibold">{user?.displayName}</p>
							<p className={`truncate text-[11px] ${isMeOnline ? "text-emerald-500" : "text-panel-muted"}`}>
								{isMeOnline ? "В сети" : "Не в сети"}
							</p>
						</div>
					</button>

					<MenuItem
						icon={<Settings className="size-[15px]" />}
						label="Настройки"
						onClick={() => { setSettingsOpen(true); setDrawerOpen(false); }}
					/>
					<MenuItem
						icon={theme === "dark" ? <Sun className="size-[15px]" /> : <Moon className="size-[15px]" />}
						label="Тёмная тема"
						checked={theme === "dark"}
						onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
					/>
					<MenuItem
						icon={<Palette className="size-[15px]" />}
						label="Инверсия панели"
						checked={invertedPanel}
						onCheckedChange={setInvertedPanel}
					/>
					<MenuItem
						icon={<Bell className="size-[15px]" />}
						label="Уведомления и сервер"
						onClick={() => { setAppSettingsOpen(true); setDrawerOpen(false); }}
					/>

					<div className="my-2 h-px bg-panel-border/60" />

					<MenuItem
						icon={<LogOut className="size-[15px]" />}
						label="Выйти"
						onClick={() => { handleLogout(); setDrawerOpen(false); }}
						destructive
					/>
				</div>
			</AppDrawer>

			<NewChatDialog open={newChatOpen} onClose={handleCloseNewChat} />
			<ProfileSettingsDialog open={settingsOpen} onClose={handleCloseSettings} />
			<AppSettingsDialog open={appSettingsOpen} onClose={handleCloseAppSettings} />
		</div>
	);
});
