import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { Toaster } from "sonner";
import "./index.css";

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60, // 1 minute
			refetchOnWindowFocus: false,
		},
	},
});

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Failed to find root element");
}

// Initialize router
await router.load();

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ReactQueryDevtools initialIsOpen={false} />
			<Toaster position="bottom-right" richColors closeButton />
		</QueryClientProvider>
	</React.StrictMode>,
);
