import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/entities/user";

export function GuestGuard({ children }: { children: ReactNode }) {
	const token = useAuthStore((s) => s.token);
	if (token) return <Navigate to="/" replace />;
	return <>{children}</>;
}
