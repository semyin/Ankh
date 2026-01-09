import { useNavigate } from "@tanstack/react-router";
import type { ArticleListItem } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function PostCard({ post }: { post: ArticleListItem }) {
	const navigate = useNavigate();
	const categoryName = post.category?.name ?? "未分类";
	const categoryEmoji = post.category?.emoji ?? "🗂️";

	return (
		<button
			type="button"
			onClick={() =>
				navigate({ to: "/article/$id", params: { id: String(post.id) } })
			}
			className="group bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer mb-4 text-left w-full"
		>
			<div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
				<span className="text-blue-600 dark:text-blue-400 font-medium">
					{categoryEmoji} {categoryName}
				</span>
				<span>·</span>
				<time>{formatDate(post.created_at)}</time>
			</div>
			<h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
				{post.title}
			</h3>
			<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
				{post.summary ?? ""}
			</p>
		</button>
	);
}
