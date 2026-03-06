import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { queryClient } from "@/shared/api/query-client";
import { router } from "./router";

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<RouterProvider router={router} />
				<Toaster position="top-right" />
			</ThemeProvider>
		</QueryClientProvider>
	);
}

export default App;
