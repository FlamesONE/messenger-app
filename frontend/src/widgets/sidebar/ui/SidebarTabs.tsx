import { memo } from "react";

const TABS = [
	{ key: "all" as const, label: "Все" },
	{ key: "personal" as const, label: "Личные" },
	{ key: "groups" as const, label: "Группы" },
];

export type SidebarTab = "all" | "personal" | "groups";

interface SidebarTabsProps {
	activeTab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
}

export const SidebarTabs = memo(function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
	return (
		<div className="flex gap-1 px-3 py-2">
			{TABS.map((tab) => (
				<button
					key={tab.key}
					type="button"
					onClick={() => onTabChange(tab.key)}
					className={
						`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
							activeTab === tab.key
								? "bg-panel-active text-panel-active-foreground"
								: "text-panel-muted hover:bg-panel-secondary hover:text-panel-foreground"
						}`
					}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
});
