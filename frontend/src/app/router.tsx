import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { AuthGuard } from "./AuthGuard";
import { GuestGuard } from "./GuestGuard";

const MessengerPage = lazy(() =>
	import("@/pages/messenger/MessengerPage").then((m) => ({ default: m.MessengerPage })),
);
const LoginPage = lazy(() =>
	import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
	import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);

function PageLoader() {
	return (
		<div className="flex h-screen items-center justify-center bg-background">
			<Loader2 className="size-6 animate-spin text-primary" />
		</div>
	);
}

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<AuthGuard>
				<Suspense fallback={<PageLoader />}>
					<MessengerPage />
				</Suspense>
			</AuthGuard>
		),
	},
	{
		path: "/login",
		element: (
			<GuestGuard>
				<Suspense fallback={<PageLoader />}>
					<LoginPage />
				</Suspense>
			</GuestGuard>
		),
	},
	{
		path: "/register",
		element: (
			<GuestGuard>
				<Suspense fallback={<PageLoader />}>
					<RegisterPage />
				</Suspense>
			</GuestGuard>
		),
	},
	{
		path: "*",
		element: <Navigate to="/" replace />,
	},
]);
