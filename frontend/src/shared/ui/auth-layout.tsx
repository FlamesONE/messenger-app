import { MessageCircle } from "lucide-react";
import { memo, type ReactNode } from "react";
import { ServerUrlPicker } from "./server-url-picker";
import { StoreBadges } from "./store-badges";

interface AuthLayoutProps {
	title: string;
	subtitle: string;
	children: ReactNode;
}

export const AuthLayout = memo(function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
	const formKey = title;
	return (
		<div className="flex min-h-screen bg-[#fafafa]">
			<div className="relative hidden flex-1 overflow-hidden rounded-r-[2rem] bg-[#0a0a0a] lg:flex lg:items-center lg:justify-center">
				<div className="absolute inset-0">
					{STARS.map((s) => (
						<div
							key={s.id}
							className="absolute rounded-full bg-white"
							style={{ left: s.x, top: s.y, width: s.size, height: s.size, opacity: s.opacity }}
						/>
					))}
				</div>

				<svg className="absolute inset-0 size-full">
					<line x1="15%" y1="12%" x2="28%" y2="8%" stroke="white" strokeWidth="0.5" opacity="0.06" />
					<line x1="28%" y1="8%" x2="42%" y2="18%" stroke="white" strokeWidth="0.5" opacity="0.05" />
					<line x1="42%" y1="18%" x2="52%" y2="30%" stroke="white" strokeWidth="0.5" opacity="0.04" />
					<line x1="68%" y1="35%" x2="78%" y2="20%" stroke="white" strokeWidth="0.5" opacity="0.05" />
					<line x1="78%" y1="20%" x2="88%" y2="12%" stroke="white" strokeWidth="0.5" opacity="0.04" />
					<line x1="22%" y1="55%" x2="35%" y2="40%" stroke="white" strokeWidth="0.5" opacity="0.04" />
					<line x1="58%" y1="68%" x2="68%" y2="50%" stroke="white" strokeWidth="0.5" opacity="0.05" />
					<line x1="68%" y1="50%" x2="80%" y2="72%" stroke="white" strokeWidth="0.5" opacity="0.04" />
				</svg>

				<div className="absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

				<div className="relative z-10 flex flex-col items-center gap-8 px-16 text-center">
					<div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
						<MessageCircle className="size-8 text-white/90" />
					</div>

					<div className="max-w-md">
						<h2 className="text-3xl font-semibold leading-snug tracking-tight text-white">
							Общайтесь свободно,
							<br />
							<span className="text-white/40">в любой точке мира</span>
						</h2>
						<p className="mt-5 text-sm leading-relaxed text-white/25">
							Быстрый и безопасный мессенджер для ваших повседневных разговоров
						</p>
					</div>

					<StoreBadges variant="dark" />
				</div>

				<div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-8 border-t border-white/[0.05] px-8 py-5">
					<span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/20">Шифрование</span>
					<span className="size-1 rounded-full bg-white/10" />
					<span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/20">Открытый протокол</span>
					<span className="size-1 rounded-full bg-white/10" />
					<span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/20">Кроссплатформа</span>
				</div>
			</div>

			<div className="auth-form-panel relative flex w-full flex-col items-center justify-center px-8 lg:w-[520px] lg:shrink-0">
				<div key={formKey} className="w-full max-w-[380px] animate-in fade-in duration-150">
					<div className="mb-10 flex flex-col items-center gap-3 lg:items-start">
						<div className="flex size-10 items-center justify-center rounded-xl bg-foreground/5 lg:hidden">
							<MessageCircle className="size-5 text-foreground/70" />
						</div>
						<div className="text-center lg:text-left">
							<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
							<p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
						</div>
					</div>
					{children}

					<ServerUrlPicker />

					<div className="mt-8 lg:hidden">
						<StoreBadges variant="light" />
					</div>
				</div>
			</div>
		</div>
	);
});

const STARS = [
	{ id: 1, x: "12%", y: "10%", size: 3, opacity: 0.5 },
	{ id: 2, x: "28%", y: "7%", size: 2, opacity: 0.35 },
	{ id: 3, x: "42%", y: "18%", size: 3.5, opacity: 0.4 },
	{ id: 4, x: "62%", y: "6%", size: 2, opacity: 0.25 },
	{ id: 5, x: "78%", y: "20%", size: 3, opacity: 0.45 },
	{ id: 6, x: "88%", y: "12%", size: 2.5, opacity: 0.5 },
	{ id: 7, x: "8%", y: "32%", size: 2, opacity: 0.3 },
	{ id: 8, x: "32%", y: "38%", size: 4, opacity: 0.3 },
	{ id: 9, x: "52%", y: "30%", size: 2.5, opacity: 0.45 },
	{ id: 10, x: "68%", y: "35%", size: 3, opacity: 0.35 },
	{ id: 11, x: "92%", y: "28%", size: 2, opacity: 0.5 },
	{ id: 12, x: "22%", y: "55%", size: 3, opacity: 0.35 },
	{ id: 13, x: "48%", y: "50%", size: 2, opacity: 0.25 },
	{ id: 14, x: "58%", y: "68%", size: 3.5, opacity: 0.4 },
	{ id: 15, x: "82%", y: "55%", size: 2, opacity: 0.35 },
	{ id: 16, x: "15%", y: "72%", size: 2.5, opacity: 0.3 },
	{ id: 17, x: "38%", y: "78%", size: 3, opacity: 0.25 },
	{ id: 18, x: "55%", y: "45%", size: 2, opacity: 0.5 },
	{ id: 19, x: "80%", y: "72%", size: 3, opacity: 0.35 },
	{ id: 20, x: "94%", y: "65%", size: 2, opacity: 0.4 },
	{ id: 21, x: "18%", y: "88%", size: 3, opacity: 0.3 },
	{ id: 22, x: "45%", y: "85%", size: 2, opacity: 0.25 },
	{ id: 23, x: "68%", y: "82%", size: 2.5, opacity: 0.4 },
	{ id: 24, x: "90%", y: "90%", size: 2, opacity: 0.3 },
	{ id: 25, x: "5%", y: "48%", size: 2, opacity: 0.5 },
	{ id: 26, x: "72%", y: "15%", size: 2, opacity: 0.6 },
	{ id: 27, x: "35%", y: "25%", size: 2, opacity: 0.55 },
	{ id: 28, x: "50%", y: "60%", size: 4, opacity: 0.2 },
	{ id: 29, x: "25%", y: "65%", size: 2, opacity: 0.35 },
	{ id: 30, x: "75%", y: "45%", size: 2.5, opacity: 0.3 },
];
