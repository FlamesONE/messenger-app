import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useChatStore, useJoinByInvite } from "@/entities/chat";
import { Button } from "@/shared/ui/components/ui/button";

export function JoinPage() {
	const { inviteCode } = useParams<{ inviteCode: string }>();
	const navigate = useNavigate();
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const joinByInvite = useJoinByInvite();

	useEffect(() => {
		if (!inviteCode || joinByInvite.isPending || joinByInvite.isSuccess || joinByInvite.isError) return;
		joinByInvite.mutate(inviteCode, {
			onSuccess: (chat) => {
				setActiveChat(chat.id);
				navigate("/", { replace: true });
			},
		});
	}, [inviteCode, joinByInvite, setActiveChat, navigate]);

	if (joinByInvite.isError) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<AlertCircle className="size-10 text-destructive" />
					<h1 className="text-lg font-semibold">Не удалось присоединиться</h1>
					<p className="text-sm text-muted-foreground">
						Ссылка-приглашение недействительна или устарела.
					</p>
				</div>
				<Button onClick={() => navigate("/", { replace: true })}>
					На главную
				</Button>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
			<Loader2 className="size-8 animate-spin text-primary" />
			<p className="text-sm text-muted-foreground">Присоединение к группе...</p>
		</div>
	);
}
