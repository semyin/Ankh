import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import PostCard from "@/components/blog/PostCard";
import Sidebar from "@/components/blog/Sidebar";
import Skeleton from "@/components/Skeleton";
import { getArticles } from "@/lib/api";

export const Route = createFileRoute("/")({ component: HomePage });

function PostCardSkeleton() {
	return (
		<div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-100 dark:border-gray-800 mb-4">
			<div className="flex items-center gap-2 mb-2">
				<Skeleton className="h-3 w-28 rounded" />
				<Skeleton className="h-3 w-3 rounded-full" />
				<Skeleton className="h-3 w-20 rounded" />
			</div>
			<Skeleton className="h-5 w-3/4 rounded mb-3" />
			<Skeleton className="h-4 w-full rounded mb-2" />
			<Skeleton className="h-4 w-5/6 rounded" />
		</div>
	);
}

function HomePage() {
	const { data: posts = [], isPending } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in items-start">
			<div className="md:col-span-2">
				{isPending
					? Array.from({ length: 6 }).map((_, idx) => (
							<PostCardSkeleton key={idx} />
						))
					: posts.map((post) => <PostCard key={post.id} post={post} />)}
			</div>
			<div className="hidden md:block md:col-span-1 sticky top-24">
				<Sidebar />
			</div>
		</div>
	);
}
