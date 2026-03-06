import { useState } from "react";
import { api } from "@/shared/api";
import { Button } from "@/shared/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/ui/card";
import { Input } from "@/shared/ui/components/ui/input";

export function EdenTest() {
	const [log, setLog] = useState<string[]>([]);
	const [token, setToken] = useState("");
	const [email, setEmail] = useState(`user${Date.now()}@test.com`);
	const [username, setUsername] = useState(`user${Date.now()}`);

	const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

	const handleRegister = async () => {
		addLog(">>> POST /auth/register");
		const { data, error } = await api.auth.register.post({
			email,
			username,
			displayName: "Eden Test User",
			password: "password123",
		});

		if (error) {
			addLog(`ERROR ${error.status}: ${JSON.stringify(error.value)}`);
			return;
		}

		addLog(`OK: user=${data.user.username}, token=${data.token.slice(0, 20)}...`);
		setToken(data.token);
	};

	const handleLogin = async () => {
		addLog(">>> POST /auth/login");
		const { data, error } = await api.auth.login.post({
			email,
			password: "password123",
		});

		if (error) {
			addLog(`ERROR ${error.status}: ${JSON.stringify(error.value)}`);
			return;
		}

		addLog(`OK: user=${data.user.username}, token=${data.token.slice(0, 20)}...`);
		setToken(data.token);
	};

	const handleGetProfile = async () => {
		addLog(">>> GET /users/me");
		const { data, error } = await api.users.me.get({
			headers: { authorization: `Bearer ${token}` },
		});

		if (error) {
			addLog(`ERROR ${error.status}: ${JSON.stringify(error.value)}`);
			return;
		}

		addLog(`OK: ${JSON.stringify(data)}`);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-8">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>Eden Treaty Test</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-2">
						<Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
						<Input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Username"
						/>
					</div>

					<div className="flex gap-2">
						<Button onClick={handleRegister}>Register</Button>
						<Button onClick={handleLogin} variant="outline">
							Login
						</Button>
						<Button onClick={handleGetProfile} variant="secondary" disabled={!token}>
							Get Profile
						</Button>
					</div>

					{token && (
						<p className="truncate text-xs text-muted-foreground">Token: {token.slice(0, 40)}...</p>
					)}

					<div className="max-h-64 overflow-y-auto rounded border bg-muted p-3 font-mono text-xs">
						{log.length === 0 && (
							<span className="text-muted-foreground">Logs will appear here...</span>
						)}
						{log.map((l, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: log entries
								key={i}
								className={
									l.startsWith("ERROR")
										? "text-destructive"
										: l.startsWith("OK")
											? "text-green-600"
											: ""
								}
							>
								{l}
							</div>
						))}
					</div>

					<Button variant="ghost" size="sm" onClick={() => setLog([])}>
						Clear logs
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
