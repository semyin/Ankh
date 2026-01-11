import { useRouterState } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import AppShell from "@/components/AppShell";

export default function RootShell({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	if (pathname.startsWith("/admin")) {
		if (pathname === "/admin/login") return children;
		return <AdminShell>{children}</AdminShell>;
	}

	return <AppShell>{children}</AppShell>;
}
