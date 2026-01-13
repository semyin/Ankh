import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	BookOpen,
	CircleUserRound,
	ExternalLink,
	FileCode,
	Home,
	LayoutDashboard,
	LayoutPanelLeft,
	Link2,
	LogOut,
	Maximize2,
	Menu,
	Minimize2,
	Moon,
	NotebookPen,
	RefreshCcw,
	Sun,
	Tags,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminContainer } from "@/components/admin/AdminLayout";
import { Button, buttonClassName } from "@/components/ui/button";
import { getMe, logout } from "@/lib/api";
import { cn } from "@/lib/utils";

function useTheme() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		const initial = stored === "dark" || (!stored && prefersDark);
		setIsDark(initial);
		document.documentElement.classList.toggle("dark", initial);
	}, []);

	const toggle = () => {
		setIsDark((prev) => {
			const next = !prev;
			document.documentElement.classList.toggle("dark", next);
			localStorage.setItem("theme", next ? "dark" : "light");
			return next;
		});
	};

	return { isDark, toggle };
}

type NavItem = {
	to: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
};

function normalizePath(pathname: string) {
	const trimmed = pathname.replace(/\/+$/, "");
	return trimmed.length ? trimmed : "/";
}

export default function AdminShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isDark, toggle } = useTheme();

	const {
		data: me,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["admin-me"],
		queryFn: getMe,
		retry: false,
	});

	useEffect(() => {
		if (isError) {
			navigate({ to: "/admin/login" });
		}
	}, [isError, navigate]);

	const navItems = useMemo(
		() => ({
			main: [
				{ to: "/admin", label: "Dashboard", icon: LayoutDashboard },
				{ to: "/admin/articles", label: "Articles", icon: NotebookPen },
			] satisfies NavItem[],
			management: [
				{ to: "/admin/categories", label: "Categories", icon: BookOpen },
				{ to: "/admin/tags", label: "Tags", icon: Tags },
				{ to: "/admin/links", label: "Links", icon: Link2 },
				{ to: "/admin/meta", label: "Meta", icon: FileCode },
				{ to: "/admin/profile", label: "Profile", icon: CircleUserRound },
			] satisfies NavItem[],
		}),
		[],
	);

	const [isCollapsed, setIsCollapsed] = useState(false);
	useEffect(() => {
		const stored = localStorage.getItem("admin.sidebarCollapsed");
		setIsCollapsed(stored === "true");
	}, []);
	const toggleCollapsed = () => {
		setIsCollapsed((prev) => {
			const next = !prev;
			localStorage.setItem("admin.sidebarCollapsed", String(next));
			return next;
		});
	};

	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	useEffect(() => {
		setIsMobileNavOpen(false);
	}, [pathname]);

	const [isFullscreen, setIsFullscreen] = useState(false);
	useEffect(() => {
		const update = () => setIsFullscreen(Boolean(document.fullscreenElement));
		update();
		document.addEventListener("fullscreenchange", update);
		return () => document.removeEventListener("fullscreenchange", update);
	}, []);
	const toggleFullscreen = async () => {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
				return;
			}
			await document.documentElement.requestFullscreen();
		} catch {
			// ignore
		}
	};

	const onLogout = async () => {
		try {
			await logout();
		} finally {
			navigate({ to: "/admin/login" });
		}
	};

	const refresh = async () => {
		try {
			await queryClient.invalidateQueries();
		} catch {
			// ignore
		}
	};

	if (isPending) {
		return (
			<div className="min-h-screen grid place-items-center bg-background text-foreground">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<aside
					className={cn(
						"hidden md:flex flex-col border-r border-border bg-muted/20 transition-[width] duration-200 ease-in-out",
						isCollapsed ? "w-16" : "w-64",
					)}
				>
					<div className="h-14 px-4 flex items-center border-b border-border bg-background">
						<Link to="/admin" className="flex items-center gap-3">
							<span className="h-8 w-8 rounded-lg bg-primary/10 ring-1 ring-primary/20" />
							<div className={cn("leading-tight", isCollapsed && "hidden")}>
								<div className="text-sm font-semibold">Ankh</div>
								<div className="text-xs text-muted-foreground">Admin</div>
							</div>
						</Link>
					</div>

					<nav className="flex-1 p-2 space-y-6">
						<NavGroup
							title="Platform"
							items={navItems.main}
							isCollapsed={isCollapsed}
						/>
						<NavGroup
							title="Management"
							items={navItems.management}
							isCollapsed={isCollapsed}
						/>
					</nav>

					<div className="border-t border-border bg-background p-3">
						<div
							className={cn(
								"flex items-center gap-3 rounded-lg px-2 py-2",
								isCollapsed && "justify-center px-0",
							)}
						>
							<div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
								<CircleUserRound className="h-5 w-5" />
							</div>
							<div className={cn("min-w-0", isCollapsed && "hidden")}>
								<div className="truncate text-sm font-medium">
									{me?.email ?? "Admin"}
								</div>
								<div className="truncate text-xs text-muted-foreground">
									{me?.user_metadata?.full_name ?? "Signed in"}
								</div>
							</div>
						</div>
					</div>
				</aside>

				<div className="flex-1 flex flex-col">
					<header className="h-14 border-b border-border bg-background">
						<div className="h-full px-4 md:px-8 flex items-center justify-between">
							<div className="flex items-center gap-2 min-w-0">
								<div className="md:hidden">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setIsMobileNavOpen((prev) => !prev)}
										aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
									>
										{isMobileNavOpen ? (
											<X className="h-5 w-5" />
										) : (
											<Menu className="h-5 w-5" />
										)}
									</Button>
								</div>
								<div className="hidden md:inline-flex">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={toggleCollapsed}
										title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
									>
										<LayoutPanelLeft className="h-4 w-4" />
									</Button>
								</div>

								<div className="md:hidden">
									<Link
										to="/admin"
										className="flex items-center text-foreground"
										aria-label="Back to dashboard"
									>
										<Home className="h-5 w-5" />
									</Link>
								</div>

								<div className="hidden md:flex items-center gap-2 min-w-0">
									<AdminBreadcrumbs pathname={pathname} />
								</div>
							</div>

							<div className="ml-auto flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={refresh}
									title="Refresh"
								>
									<RefreshCcw className="h-4 w-4" />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={toggleFullscreen}
									title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
								>
									{isFullscreen ? (
										<Minimize2 className="h-4 w-4" />
									) : (
										<Maximize2 className="h-4 w-4" />
									)}
								</Button>
								<Link
									to="/"
									target="_blank"
									className={buttonClassName({
										variant: "ghost",
										size: "icon",
									})}
									title="View site"
								>
									<ExternalLink className="h-4 w-4" />
								</Link>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={toggle}
									title={isDark ? "Switch to light" : "Switch to dark"}
								>
									{isDark ? (
										<Sun className="h-4 w-4" />
									) : (
										<Moon className="h-4 w-4" />
									)}
								</Button>
								<button
									type="button"
									onClick={onLogout}
									title="Logout"
									className={buttonClassName({
										variant: "ghost",
										size: "icon",
									})}
								>
									<LogOut className="h-4 w-4" />
								</button>
							</div>
						</div>
					</header>

					<div
						className={cn(
							"fixed inset-0 z-50 md:hidden",
							isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
						)}
						aria-hidden={!isMobileNavOpen}
					>
						<button
							type="button"
							className={cn(
								"absolute inset-0 bg-black/50 transition-opacity duration-200",
								isMobileNavOpen ? "opacity-100" : "opacity-0",
							)}
							onClick={() => setIsMobileNavOpen(false)}
							aria-label="Close menu"
							tabIndex={isMobileNavOpen ? 0 : -1}
						/>
						<aside
							className={cn(
								"absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background transition-transform duration-200 ease-out",
								isMobileNavOpen
									? "translate-x-0 shadow-2xl"
									: "-translate-x-full shadow-none",
							)}
						>
							<div className="h-14 px-4 flex items-center justify-between border-b border-border">
								<Link
									to="/admin"
									className="flex items-center gap-3"
									tabIndex={isMobileNavOpen ? 0 : -1}
								>
									<span className="h-8 w-8 rounded-lg bg-primary/10 ring-1 ring-primary/20" />
									<div className="leading-tight">
										<div className="text-sm font-semibold">Ankh</div>
										<div className="text-xs text-muted-foreground">Admin</div>
									</div>
								</Link>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setIsMobileNavOpen(false)}
									aria-label="Close menu"
									tabIndex={isMobileNavOpen ? 0 : -1}
								>
									<X className="h-5 w-5" />
								</Button>
							</div>
							<nav className="flex-1 p-3 space-y-6 overflow-y-auto">
								<NavGroup
									title="Platform"
									items={navItems.main}
									isCollapsed={false}
									onItemClick={() => setIsMobileNavOpen(false)}
									itemTabIndex={isMobileNavOpen ? 0 : -1}
								/>
								<NavGroup
									title="Management"
									items={navItems.management}
									isCollapsed={false}
									onItemClick={() => setIsMobileNavOpen(false)}
									itemTabIndex={isMobileNavOpen ? 0 : -1}
								/>
							</nav>
						</aside>
					</div>

					<main className="flex-1 px-4 py-6 md:px-8">
						<AdminContainer>{children}</AdminContainer>
					</main>
				</div>
			</div>
		</div>
	);
}

function NavGroup({
	title,
	items,
	isCollapsed,
	onItemClick,
	itemTabIndex,
}: {
	title: string;
	items: NavItem[];
	isCollapsed: boolean;
	onItemClick?: () => void;
	itemTabIndex?: number;
}) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const normalizedPath = normalizePath(pathname);

	return (
		<div className="space-y-2">
			<div
				className={cn(
					"px-2 text-xs font-medium text-muted-foreground",
					isCollapsed && "hidden",
				)}
			>
				{title}
			</div>
			<div className="space-y-1">
				{items.map((item) => {
					const normalizedItem = normalizePath(item.to);
					const active =
						normalizedItem === "/admin"
							? normalizedPath === "/admin"
							: normalizedPath === normalizedItem ||
								normalizedPath.startsWith(`${normalizedItem}/`);
					const Icon = item.icon;
					return (
						<Link
							key={item.to}
							to={item.to}
							onClick={onItemClick}
							tabIndex={itemTabIndex}
							className={cn(
								"flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
								isCollapsed && "justify-center",
								active
									? "bg-primary/10 text-primary font-medium"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							<Icon className="h-4 w-4" />
							<span className={cn("truncate", isCollapsed && "hidden")}>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

function AdminBreadcrumbs({ pathname }: { pathname: string }) {
	const normalized = normalizePath(pathname);
	if (!normalized.startsWith("/admin")) return null;

	const parts = normalized.split("/").filter(Boolean);
	const section = parts[1] ?? "";
	const sub = parts[2] ?? "";

	const crumbs: Array<{ label: string; to?: string }> = [
		{ label: "Dashboard", to: "/admin" },
	];

	const sectionLabel =
		section === "articles"
			? "Articles"
			: section === "categories"
				? "Categories"
				: section === "tags"
					? "Tags"
					: section === "links"
						? "Links"
						: section === "meta"
							? "Meta"
							: section === "profile"
								? "Profile"
								: "";

	if (sectionLabel)
		crumbs.push({ label: sectionLabel, to: `/admin/${section}` });

	if (section === "articles") {
		if (sub === "new") crumbs.push({ label: "New" });
		else if (sub) crumbs.push({ label: `#${sub}` });
	}

	return (
		<nav className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
			{crumbs.map((c, idx) => (
				<div
					key={`${c.label}-${idx}`}
					className="flex items-center gap-2 min-w-0"
				>
					{c.to ? (
						<Link to={c.to} className="truncate hover:text-foreground">
							{c.label}
						</Link>
					) : (
						<span className="truncate text-foreground">{c.label}</span>
					)}
					{idx < crumbs.length - 1 ? <span>/</span> : null}
				</div>
			))}
		</nav>
	);
}
