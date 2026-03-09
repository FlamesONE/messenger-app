import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { AuthGuard } from "./AuthGuard";
import { GuestGuard } from "./GuestGuard";
import { PageLoader } from "@/shared/ui/page-loader";
import { MessengerSkeleton } from "@/shared/ui/messenger-skeleton";

const MessengerPage = lazy(() =>
	import("@/pages/messenger/MessengerPage").then((m) => ({ default: m.MessengerPage })),
);
const LoginPage = lazy(() =>
	import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
	import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const JoinPage = lazy(() =>
	import("@/pages/join/JoinPage").then((m) => ({ default: m.JoinPage })),
);

const messengerElement = (
	<AuthGuard>
		<Suspense fallback={<MessengerSkeleton />}>
			<MessengerPage />
		</Suspense>
	</AuthGuard>
);

export const router = createBrowserRouter([
	{
		path: "/",
		element: messengerElement,
	},
	{
		path: "/chat/:chatId",
		element: messengerElement,
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
		path: "/join/:inviteCode",
		element: (
			<AuthGuard>
				<Suspense fallback={<PageLoader />}>
					<JoinPage />
				</Suspense>
			</AuthGuard>
		),
	},
	{
		path: "*",
		element: <Navigate to="/" replace />,
	},
]);
