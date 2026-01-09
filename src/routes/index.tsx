import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import PostCard from "@/components/blog/PostCard";
import Sidebar from "@/components/blog/Sidebar";
import { getArticles } from "@/lib/api";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const sidebarRef = useRef<HTMLDivElement | null>(null);
	const [canStick, setCanStick] = useState(true);

	const { data: posts = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});

	useEffect(() => {
		const el = sidebarRef.current;
		if (!el) return;

		const topOffset = 96;
		const compute = () => {
			const available = window.innerHeight - topOffset;
			setCanStick(el.scrollHeight <= available);
		};

		compute();

		let ro: ResizeObserver | null = null;
		if (typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(() => compute());
			ro.observe(el);
		}

		window.addEventListener("resize", compute);
		return () => {
			window.removeEventListener("resize", compute);
			ro?.disconnect();
		};
	}, []);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in items-start">
			<div className="md:col-span-2 space-y-4">
				{posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
			<div
				ref={sidebarRef}
				className={[
					"hidden md:block md:col-span-1",
					canStick ? "sticky top-24" : "",
				].join(" ")}
			>
				<Sidebar />
			</div>
		</div>
	);
}
