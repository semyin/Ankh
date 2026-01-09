import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import PostCard from "@/components/blog/PostCard";
import Sidebar from "@/components/blog/Sidebar";
import { getArticles } from "@/lib/api";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const { data: posts = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in items-start">
			<div className="md:col-span-2">
				{posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
			<div className="hidden md:block md:col-span-1 sticky top-24">
				<Sidebar />
			</div>
		</div>
	);
}
