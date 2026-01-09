import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getArticles, getCategories, getProfile, getTags } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
	const navigate = useNavigate();
	const { data: profile } = useQuery({
		queryKey: ["profile"],
		queryFn: getProfile,
	});
	const { data: posts = [] } = useQuery({
		queryKey: ["articles"],
		queryFn: getArticles,
	});
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: getTags,
	});

	const postCount = posts.length;
	const categoryCount = categories.length;
	const tagCount = tags.length;
	const latest = posts[0];

	return (
		<div className="space-y-6 fade-in">
			<section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-10">
				<div className="flex flex-col sm:flex-row sm:items-center gap-6">
					<div className="mx-auto sm:mx-0 w-20 h-20 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold text-2xl">
						{(profile?.author_name ?? profile?.name ?? "D").slice(0, 1)}
					</div>
					<div className="flex-1 text-center sm:text-left">
						<div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
							About
						</div>
						<h1 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
							关于
						</h1>
						<p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
							这里是个人介绍与站点信息页。你可以在下方用 Markdown
							维护更完整的自我介绍、技术栈与联系方式。
						</p>
						<div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
							<a
								href={
									typeof profile?.contacts === "object" &&
									profile?.contacts?.email
										? `mailto:${profile.contacts.email}`
										: "mailto:hi@devexpert.com"
								}
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
							>
								邮箱联系
							</a>
							<a
								href={
									typeof profile?.contacts === "object" &&
									profile?.contacts?.github
										? profile.contacts.github
										: "https://github.com/devexpert"
								}
								target="_blank"
								rel="noopener noreferrer"
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
							>
								GitHub
							</a>
							<button
								type="button"
								onClick={() => navigate({ to: "/" })}
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
							>
								返回首页
							</button>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
						<div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3">
							<div className="text-lg font-bold text-gray-900 dark:text-white">
								{postCount}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								文章
							</div>
						</div>
						<div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3">
							<div className="text-lg font-bold text-gray-900 dark:text-white">
								{categoryCount}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								分类
							</div>
						</div>
						<div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3">
							<div className="text-lg font-bold text-gray-900 dark:text-white">
								{tagCount}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								标签
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				<aside className="lg:col-span-4 space-y-6">
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
						<h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
							站点信息
						</h3>
						<div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
							<div className="flex items-center justify-between gap-3">
								<span className="text-gray-500 dark:text-gray-500">
									最新文章
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-200 text-right">
									{latest ? latest.title : "—"}
								</span>
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="text-gray-500 dark:text-gray-500">
									更新日期
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-200">
									{latest ? formatDate(latest.created_at) : "—"}
								</span>
							</div>
						</div>
						{latest ? (
							<button
								type="button"
								onClick={() =>
									navigate({
										to: "/article/$id",
										params: { id: String(latest.id) },
									})
								}
								className="mt-4 w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
							>
								阅读最新文章
							</button>
						) : null}
					</div>

					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
						<h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
							快速导航
						</h3>
						<div className="mt-4 grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => navigate({ to: "/" })}
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
							>
								首页
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/categories" })}
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
							>
								分类
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/tags" })}
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
							>
								标签
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/links" })}
								className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
							>
								友链
							</button>
						</div>
					</div>
				</aside>

				<div className="lg:col-span-8">
					<div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-10">
						<div
							className="prose dark:prose-invert max-w-none text-base sm:text-lg"
							dangerouslySetInnerHTML={{
								__html: renderMarkdown(profile?.about_content ?? ""),
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
