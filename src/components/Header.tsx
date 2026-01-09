import { Link } from "@tanstack/react-router";

export default function Header({
	isDark,
	onToggleTheme,
	onOpenSearch,
	isMobileMenuOpen,
	onToggleMobileMenu,
}: {
	isDark: boolean;
	onToggleTheme: () => void;
	onOpenSearch: () => void;
	isMobileMenuOpen: boolean;
	onToggleMobileMenu: () => void;
}) {
	return (
		<header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
			<div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
				<Link
					to="/"
					className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
				>
					Dev<span className="text-blue-600">Log</span>
				</Link>
				<div className="flex items-center gap-6">
					<nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-500 dark:text-gray-400">
						<Link
							to="/"
							className="nav-item hover:text-black dark:hover:text-white transition-colors"
							activeProps={{
								className:
									"nav-item hover:text-black dark:hover:text-white transition-colors text-black dark:text-white font-bold",
							}}
						>
							首页
						</Link>
						<Link
							to="/categories"
							className="nav-item hover:text-black dark:hover:text-white transition-colors"
							activeProps={{
								className:
									"nav-item hover:text-black dark:hover:text-white transition-colors text-black dark:text-white font-bold",
							}}
						>
							分类
						</Link>
						<Link
							to="/tags"
							className="nav-item hover:text-black dark:hover:text-white transition-colors"
							activeProps={{
								className:
									"nav-item hover:text-black dark:hover:text-white transition-colors text-black dark:text-white font-bold",
							}}
						>
							标签
						</Link>
						<Link
							to="/links"
							className="nav-item hover:text-black dark:hover:text-white transition-colors"
							activeProps={{
								className:
									"nav-item hover:text-black dark:hover:text-white transition-colors text-black dark:text-white font-bold",
							}}
						>
							友链
						</Link>
						<Link
							to="/about"
							className="nav-item hover:text-black dark:hover:text-white transition-colors"
							activeProps={{
								className:
									"nav-item hover:text-black dark:hover:text-white transition-colors text-black dark:text-white font-bold",
							}}
						>
							关于
						</Link>
					</nav>
					<div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 hidden md:block" />
					<div className="flex items-center gap-3">
						<button
							id="search-btn"
							type="button"
							onClick={onOpenSearch}
							className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Search</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
						<button
							id="theme-toggle"
							type="button"
							onClick={onToggleTheme}
							className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
						>
							<svg
								id="sun-icon"
								className={["w-5 h-5", isDark ? "block" : "hidden"].join(" ")}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Light mode</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
							<svg
								id="moon-icon"
								className={["w-5 h-5", isDark ? "hidden" : "block"].join(" ")}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Dark mode</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
								/>
							</svg>
						</button>
						<button
							id="mobile-menu-btn"
							type="button"
							onClick={onToggleMobileMenu}
							className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Menu</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
			<div
				id="mobile-menu"
				className={[
					"md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute w-full shadow-lg",
					isMobileMenuOpen ? "" : "hidden",
				].join(" ")}
			>
				<div className="px-4 py-2 space-y-1">
					<Link
						to="/"
						className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						首页
					</Link>
					<Link
						to="/categories"
						className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						分类
					</Link>
					<Link
						to="/tags"
						className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						标签
					</Link>
					<Link
						to="/about"
						className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						关于
					</Link>
				</div>
			</div>
		</header>
	);
}
