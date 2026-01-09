import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getArticle, getArticles } from "@/lib/api";
import { estimateReadingTime, formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/article/$id")({
	component: ArticlePage,
});

function ArticlePage() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const articleId = Number(id);

	const articleQuery = useQuery({
		queryKey: ["article", articleId],
		queryFn: () => getArticle(articleId),
		enabled: Number.isFinite(articleId),
	});
	const post = articleQuery.data;

	const { data: allPosts = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	type TocItem = { text: string; level: 2 | 3; id: string };
	const [toc, setToc] = useState<TocItem[]>([]);

	const readTime = useMemo(
		() => estimateReadingTime(post?.content ?? ""),
		[post?.content],
	);

	const orderedPosts = useMemo(
		() =>
			[...allPosts].sort((a, b) => {
				const da = new Date(a.created_at.replace(" ", "T")).getTime();
				const db = new Date(b.created_at.replace(" ", "T")).getTime();
				return da - db;
			}),
		[allPosts],
	);

	const { prevPost, nextPost } = useMemo(() => {
		const currentIndex = orderedPosts.findIndex((p) => p.id === articleId);
		return {
			prevPost: currentIndex > 0 ? orderedPosts[currentIndex - 1] : null,
			nextPost:
				currentIndex >= 0 && currentIndex < orderedPosts.length - 1
					? orderedPosts[currentIndex + 1]
					: null,
		};
	}, [articleId, orderedPosts]);

	const [activeId, setActiveId] = useState<string | null>(null);
	const rafId = useRef<number | null>(null);
	const headingPositionsRef = useRef<Array<{ id: string; top: number }>>([]);

	useEffect(() => {
		if (!post) return;

		const buildToc = () => {
			const headings = Array.from(
				document.querySelectorAll<HTMLElement>(
					"#article-root .prose h2, #article-root .prose h3",
				),
			).filter((h) => h.id);

			setToc(
				headings
					.map((h) => ({
						id: h.id,
						text: (h.textContent ?? "").trim(),
						level: h.tagName === "H3" ? 3 : 2,
					}))
					.filter((h) => h.text),
			);
		};

		const raf = window.requestAnimationFrame(buildToc);
		return () => window.cancelAnimationFrame(raf);
	}, [post]);

	useEffect(() => {
		if (!post) return;

		const topOffset = 96;

		const getHeadings = () =>
			Array.from(
				document.querySelectorAll<HTMLElement>(
					"#article-root .prose h2, #article-root .prose h3",
				),
			).filter((h) => h.id);

		const updatePositions = () => {
			const headings = getHeadings();
			headingPositionsRef.current = headings.map((h) => ({
				id: h.id,
				top: h.getBoundingClientRect().top + window.scrollY,
			}));
		};

		const computeActive = () => {
			const positions = headingPositionsRef.current;
			if (!positions.length) return null;

			const currentScroll = window.scrollY + topOffset + 1;
			let current = positions[0].id;

			for (const pos of positions) {
				if (pos.top <= currentScroll) current = pos.id;
				else break;
			}

			return current;
		};

		const update = () => {
			const id = computeActive();
			if (id) setActiveId(id);
		};

		const onScroll = () => {
			if (rafId.current) return;
			rafId.current = window.requestAnimationFrame(() => {
				rafId.current = null;
				update();
			});
		};

		const onResize = () => {
			updatePositions();
			onScroll();
		};

		updatePositions();
		update();

		const root = document.getElementById("article-root");
		const imgs = root ? Array.from(root.querySelectorAll("img")) : [];
		const onImgLoad = () => onResize();
		for (const img of imgs) img.addEventListener("load", onImgLoad);

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			for (const img of imgs) img.removeEventListener("load", onImgLoad);
			if (rafId.current) window.cancelAnimationFrame(rafId.current);
			rafId.current = null;
		};
	}, [post]);

	if (articleQuery.isLoading) {
		return <div className="text-center py-20">加载中...</div>;
	}
	if (!post) return <div className="text-center py-20">文章未找到</div>;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative fade-in">
			<article id="article-root" className="lg:col-span-9">
				<div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-lg border border-gray-200 dark:border-gray-800">
					<header className="mb-8 text-center">
						<h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
							{post.title}
						</h1>
						<div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
							<span>📅 {formatDate(post.created_at)}</span>
							<span>⏱️ 约 {readTime} 分钟阅读</span>
						</div>
						<div className="flex flex-wrap justify-center gap-2">
							{(post.tags ?? []).map((t) => (
								<button
									key={t.id}
									type="button"
									onClick={() =>
										navigate({ to: "/tags", search: { name: t.name } })
									}
									className="cursor-pointer px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
								>
									# {t.name}
								</button>
							))}
						</div>
					</header>
					<div
						className="prose dark:prose-invert max-w-none border-t border-gray-100 dark:border-gray-800 pt-8"
						dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
					/>
					<nav className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
						{prevPost ? (
							<button
								type="button"
								onClick={() =>
									navigate({
										to: "/article/$id",
										params: { id: String(prevPost.id) },
									})
								}
								className="group text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
									上一篇
								</div>
								<div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
									{prevPost.title}
								</div>
							</button>
						) : (
							<div />
						)}
						{nextPost ? (
							<button
								type="button"
								onClick={() =>
									navigate({
										to: "/article/$id",
										params: { id: String(nextPost.id) },
									})
								}
								className="group text-right p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
									下一篇
								</div>
								<div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
									{nextPost.title}
								</div>
							</button>
						) : (
							<div />
						)}
					</nav>
				</div>
			</article>

			<aside className="hidden lg:block lg:col-span-3">
				<div className="sticky top-24">
					<h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-wider pl-4">
						目录
					</h4>
					<nav className="space-y-1 border-l border-gray-200 dark:border-gray-800">
						{toc.map((item) => (
							<a
								key={item.id}
								href={`#${item.id}`}
								onClick={(e) => {
									e.preventDefault();
									document
										.getElementById(item.id)
										?.scrollIntoView({ behavior: "smooth", block: "start" });
									setActiveId(item.id);
								}}
								data-id={item.id}
								className={[
									"toc-link block text-xs py-1.5 hover:text-blue-500 transition-colors border-l-2 border-transparent pl-4",
									item.level === 3
										? "ml-2 text-gray-400"
										: "text-gray-500 dark:text-gray-400",
									activeId === item.id ? "active" : "",
								].join(" ")}
							>
								{item.text}
							</a>
						))}
					</nav>
				</div>
			</aside>
		</div>
	);
}
