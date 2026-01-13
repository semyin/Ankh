import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SearchModal from "@/components/SearchModal";
import { getArticles } from "@/lib/api";

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

function useBackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 300);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

	return { visible, scrollToTop };
}

function useReadingProgress(enabled: boolean) {
	const [progress, setProgress] = useState(0);
	const rafId = useRef<number | null>(null);

	useEffect(() => {
		if (!enabled) {
			setProgress(0);
			return;
		}

		const update = () => {
			const article = document.getElementById("article-root");
			if (!article) return setProgress(0);

			const scrollY = window.scrollY || window.pageYOffset || 0;
			const start = article.getBoundingClientRect().top + scrollY;
			const end = start + article.scrollHeight - window.innerHeight;
			const raw = end > start ? (scrollY - start) / (end - start) : 0;
			const next = Math.max(0, Math.min(1, raw));
			setProgress(next);
		};

		const onScroll = () => {
			if (rafId.current) return;
			rafId.current = window.requestAnimationFrame(() => {
				rafId.current = null;
				update();
			});
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (rafId.current) window.cancelAnimationFrame(rafId.current);
			rafId.current = null;
		};
	}, [enabled]);

	return progress;
}

function useCodeBlockCopy(rootId: string) {
	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root) return;

		const timers = new Map<HTMLButtonElement, number>();

		const setButtonText = (btn: HTMLButtonElement, text: string) => {
			const original = btn.dataset.label ?? btn.textContent ?? "复制";
			btn.dataset.label = original;
			btn.textContent = text;
		};

		const restoreButtonText = (btn: HTMLButtonElement) => {
			const original = btn.dataset.label ?? "复制";
			btn.textContent = original;
		};

		const writeClipboard = async (text: string) => {
			if (!text) return;
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				return;
			}

			const ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.top = "0";
			ta.style.left = "0";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.focus();
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
		};

		const onClick = async (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			const btn = target?.closest<HTMLButtonElement>("[data-code-copy='true']");
			if (!btn) return;

			const codeEl = btn
				.closest(".code-block")
				?.querySelector<HTMLElement>("pre code");
			const text = codeEl?.textContent ?? "";
			if (!text) return;

			try {
				await writeClipboard(text);
				setButtonText(btn, "已复制");

				const existing = timers.get(btn);
				if (existing) window.clearTimeout(existing);
				const id = window.setTimeout(() => {
					restoreButtonText(btn);
					timers.delete(btn);
				}, 1500);
				timers.set(btn, id);
			} catch {
				setButtonText(btn, "复制失败");
				const existing = timers.get(btn);
				if (existing) window.clearTimeout(existing);
				const id = window.setTimeout(() => {
					restoreButtonText(btn);
					timers.delete(btn);
				}, 1500);
				timers.set(btn, id);
			}
		};

		root.addEventListener("click", onClick);
		return () => {
			root.removeEventListener("click", onClick);
			for (const [btn, id] of timers) {
				window.clearTimeout(id);
				restoreButtonText(btn);
			}
			timers.clear();
		};
	}, [rootId]);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const pathnameRef = useRef(pathname);

	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { isDark, toggle } = useTheme();
	const readingProgressId = useId();
	const appContainerId = useId();
	const backToTopButtonId = useId();

	useEffect(() => {
		if (pathnameRef.current === pathname) return;
		pathnameRef.current = pathname;
		setIsSearchOpen(false);
		setIsMobileMenuOpen(false);
		window.scrollTo(0, 0);
	}, [pathname]);

	useCodeBlockCopy(appContainerId);

	const isArticle = pathname.startsWith("/article/");
	const readingProgress = useReadingProgress(isArticle);

	const { data: articles = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	const searchIndex = useMemo(
		() =>
			articles.map((a) => ({
				id: a.id,
				title: a.title,
				summary: a.summary ?? "",
			})),
		[articles],
	);

	const { visible: backToTopVisible, scrollToTop } = useBackToTop();

	return (
		<>
			<Header
				isDark={isDark}
				onToggleTheme={toggle}
				onOpenSearch={() => setIsSearchOpen(true)}
				isMobileMenuOpen={isMobileMenuOpen}
				onToggleMobileMenu={() => setIsMobileMenuOpen((v) => !v)}
			/>

			<div
				id={readingProgressId}
				className={[
					"fixed top-0 left-0 z-50 h-0.5 w-full bg-blue-600/80 dark:bg-blue-500/80 pointer-events-none",
					isArticle ? "" : "hidden",
				].join(" ")}
				style={{ transform: `scaleX(${readingProgress})` }}
			/>

			<SearchModal
				open={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
				items={searchIndex}
			/>

			<main
				id={appContainerId}
				className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 md:py-8"
			>
				{children}
			</main>

			<div className="fixed inset-x-0 bottom-0 mx-auto max-w-5xl pointer-events-none z-40 px-4 mb-8">
				<button
					id={backToTopButtonId}
					type="button"
					onClick={scrollToTop}
					className={[
						"absolute right-4 bottom-0 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all pointer-events-auto",
						backToTopVisible ? "" : "opacity-0 translate-y-10",
					].join(" ")}
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Back to top</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M5 10l7-7m0 0l7 7m-7-7v18"
						/>
					</svg>
				</button>
			</div>

			<Footer />
		</>
	);
}
