import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getFriendLinks } from "@/lib/api";

export const Route = createFileRoute("/links")({ component: LinksPage });

function LinksPage() {
	const { data: friends = [] } = useQuery({
		queryKey: ["friend-links"],
		queryFn: getFriendLinks,
	});

	return (
		<>
			<div className="text-center mb-10 fade-in">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					友情链接
				</h1>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 fade-in">
				{friends.map((f) => (
					<a
						key={f.id}
						href={f.url}
						className="block bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-400 hover:-translate-y-1 transition-all text-center group"
						target="_blank"
						rel="noopener noreferrer"
					>
						<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
							{f.name.slice(0, 2).toUpperCase()}
						</div>
						<div className="font-bold text-sm text-gray-900 dark:text-white mb-1">
							{f.name}
						</div>
						<div className="text-xs text-gray-400 truncate">
							{f.description ?? ""}
						</div>
					</a>
				))}
			</div>
		</>
	);
}
