import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router";
import { Toaster } from "@/shared/ui/components/ui/sonner";
import { queryClient } from "@/shared/api/query-client";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import { NotificationBanner } from "@/shared/ui/notification-banner";
import { TooltipProvider } from "@/shared/ui/components/ui/tooltip";
import { router } from "./router";

export function App() {
	return (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
					<TooltipProvider delayDuration={300} skipDelayDuration={100}>
						<RouterProvider router={router} />
						<NotificationBanner />
						<Toaster position="top-right" gap={8} />
					</TooltipProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	);
}

export default App;
