import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PostCard from "@/components/blog/PostCard";
import { getArticles, getTags } from "@/lib/api";

export const Route = createFileRoute("/tags")({
	component: TagsPage,
	validateSearch: (search: Record<string, unknown>) => ({
		name: typeof search.name === "string" ? search.name : undefined,
	}),
});

function TagsPage() {
	const navigate = useNavigate();
	const { name } = Route.useSearch();

	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: getTags,
	});
	const { data: posts = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	const filtered = name
		? posts.filter((p) => (p.tags ?? []).some((t) => t.name === name))
		: [];

	return (
		<>
			<div className="text-center mb-8 fade-in">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					标签云
				</h1>
				<p className="text-gray-500 dark:text-gray-400 text-sm">
					通过关键词连接碎片化的思考
				</p>
			</div>
			<div className="flex flex-wrap justify-center gap-2 mb-10 mx-auto fade-in">
				{tags.map((tag) => {
					const isActive = name === tag.name;
					const activeClass = isActive
						? "bg-blue-50 text-blue-700 border-blue-300 shadow-sm scale-105 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
						: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-500";
					return (
						<button
							key={tag.id}
							type="button"
							onClick={() =>
								navigate({ to: "/tags", search: { name: tag.name } })
							}
							className={`${activeClass} px-4 py-2 rounded-lg border text-sm font-medium transition-all`}
						>
							{tag.name}
						</button>
					);
				})}
			</div>

			{name ? (
				<div className="fade-in border-t border-gray-100 dark:border-gray-800 pt-8">
					<div className="text-sm text-gray-400 mb-6">
						包含 <span className="text-blue-500 font-bold">#{name}</span> 的文章
					</div>
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
