import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { getProfile, getTags } from "@/lib/api";
import RealtimeCard from "@/components/blog/RealtimeCard";
import WeatherCard from "@/components/blog/WeatherCard";

export default function Sidebar() {
	const navigate = useNavigate();
	const { data: profile } = useQuery({
		queryKey: ["profile"],
		queryFn: getProfile,
	});
	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: getTags,
	});

	const topTags = useMemo(
		() =>
			[...tags]
				.sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0))
				.slice(0, 8),
		[tags],
	);

	return (
		<div className="space-y-6">
			<div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
				<div className="flex flex-col items-center text-center">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold text-xl mb-3">
						{(profile?.author_name ?? profile?.name ?? "D").slice(0, 1)}
					</div>
					<h3 className="font-bold text-gray-900 dark:text-white">
						{profile?.author_name ?? "DevExpert"}
					</h3>
					<p className="text-xs text-gray-500 mb-4">
						{profile?.description ?? "Frontend Developer"}
					</p>
					<p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
						{profile?.bio ?? "追求极致用户体验，分享技术与生活。"}
					</p>
					<div className="flex gap-2 w-full">
						<button
							type="button"
							onClick={() => navigate({ to: "/about" })}
							className="flex-1 py-1.5 text-xs font-medium bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							关于我
						</button>
						<a
							href={profile?.url ?? "https://github.com"}
							target="_blank"
							rel="noopener noreferrer"
							className="flex-1 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
						>
							Github
						</a>
					</div>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
				<h4 className="font-bold text-xs mb-3 text-gray-900 dark:text-white uppercase tracking-wider">
					热门标签
				</h4>
				<div className="flex flex-wrap gap-2">
					{topTags.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() =>
								navigate({ to: "/tags", search: { name: t.name } })
							}
							className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded transition-colors"
						>
							#{t.name}
						</button>
					))}
				</div>
			</div>

			<RealtimeCard />
			<WeatherCard />
		</div>
	);
}
