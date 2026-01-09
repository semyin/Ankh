import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PostCard from "@/components/blog/PostCard";
import { getArticles, getCategories } from "@/lib/api";

export const Route = createFileRoute("/categories")({
	component: CategoriesPage,
	validateSearch: (search: Record<string, unknown>) => ({
		id:
			typeof search.id === "string"
				? Number(search.id)
				: typeof search.id === "number"
					? search.id
					: undefined,
	}),
});

function CategoriesPage() {
	const navigate = useNavigate();
	const { id } = Route.useSearch();

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
	const { data: posts = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	const filtered = id ? posts.filter((p) => p.category?.id === id) : [];

	return (
		<>
			<div className="text-center mb-8 fade-in">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					文章分类
				</h1>
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					探索技术与生活的不同维度
				</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 fade-in">
				{categories.map((cat) => {
					const isActive = id === cat.id;
					const activeClass = isActive
						? "bg-blue-50 text-gray-900 border-blue-300 ring-1 ring-blue-200 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950 dark:bg-blue-900/20 dark:text-white dark:border-blue-700"
						: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md";
					const count = posts.filter((p) => p.category?.id === cat.id).length;

					return (
						<button
							key={cat.id}
							type="button"
							onClick={() =>
								navigate({ to: "/categories", search: { id: cat.id } })
							}
							className={`${activeClass} p-4 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col items-center text-center justify-center min-h-[140px] group`}
						>
							<div className="text-3xl mb-2">{cat.emoji ?? "🗂️"}</div>
							<div className="font-bold text-sm mb-1">{cat.name}</div>
							<div className="text-xs opacity-70 mb-2 line-clamp-1">
								{cat.description ?? ""}
							</div>
							<div className="text-xs font-mono opacity-50 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
								{count} 篇文章
							</div>
						</button>
					);
				})}
			</div>

			{id ? (
				<div className="fade-in border-t border-gray-100 dark:border-gray-800 pt-8">
					<div className="text-sm text-gray-400 mb-6">相关文章</div>
					{filtered.length ? (
						filtered.map((p) => <PostCard key={p.id} post={p} />)
					) : (
						<div className="text-center py-10">暂无文章</div>
					)}
				</div>
			) : null}
		</>
	);
}
