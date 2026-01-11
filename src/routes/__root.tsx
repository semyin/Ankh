import type { QueryClient } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import RootShell from "@/components/RootShell";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import { Provider as QueryProvider } from "@/integrations/tanstack-query/root-provider";
import appCss from "@/styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
			{ title: "DevLog | 极简技术博客" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { queryClient } = Route.useRouteContext();

	return (
		<html lang="zh-CN" className="scroll-smooth">
			<head>
				<HeadContent />
			</head>
			<body className="bg-background text-foreground transition-colors duration-300 min-h-screen flex flex-col">
				<QueryProvider queryClient={queryClient}>
					<RootShell>{children}</RootShell>
				</QueryProvider>
				{import.meta.env.DEV ? (
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				) : null}
				<Scripts />
			</body>
		</html>
	);
}
