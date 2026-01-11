import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader, AdminSurface } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getAdminArticles } from "@/lib/api";

export const Route = createFileRoute("/admin/")({ component: AdminDashboardPage });

type RangeKey = "3m" | "30d" | "7d";
type TableTabKey = "outline" | "past" | "people" | "focus";

function AdminDashboardPage() {
	const [range, setRange] = useState<RangeKey>("3m");
	const [tab, setTab] = useState<TableTabKey>("outline");

	const totalQuery = useQuery({
		queryKey: ["admin-articles", { scope: "total-count" }],
		queryFn: () => getAdminArticles({ page: 1, pageSize: 1 }),
	});
	const publishedCountQuery = useQuery({
		queryKey: ["admin-articles", { scope: "published-count" }],
		queryFn: () => getAdminArticles({ is_published: true, page: 1, pageSize: 1 }),
	});
	const draftCountQuery = useQuery({
		queryKey: ["admin-articles", { scope: "draft-count" }],
		queryFn: () => getAdminArticles({ is_published: false, page: 1, pageSize: 1 }),
	});
	const latestQuery = useQuery({
		queryKey: ["admin-articles", { scope: "latest" }],
		queryFn: () => getAdminArticles({ page: 1, pageSize: 8 }),
	});

	const total = totalQuery.data?.count ?? 0;
	const published = publishedCountQuery.data?.count ?? 0;
	const drafts = draftCountQuery.data?.count ?? 0;
	const latest = latestQuery.data?.items ?? [];

	const visitors = useMemo(() => {
		const len = range === "3m" ? 90 : range === "30d" ? 30 : 7;
		const base = range === "7d" ? 38 : 28;
		const points = Array.from({ length: len }).map((_, i) => {
			const wave = Math.sin(i / 3.2) * 8 + Math.sin(i / 9.1) * 10;
			const noise = (i * 9301 + 49297) % 233280;
			const n = (noise / 233280 - 0.5) * 8;
			return Math.max(4, Math.round(base + wave + n));
		});
		return points;
	}, [range]);

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Documents"
				description="A shadcn-style dashboard layout for your admin."
				actions={
					<a
						href="https://github.com"
						target="_blank"
						rel="noreferrer"
						className={buttonClassName({ variant: "outline", size: "sm" })}
					>
						GitHub
					</a>
				}
			/>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<MetricCard
					title="Total Articles"
					value={totalQuery.isPending ? "—" : String(total)}
					change="+12.5%"
					subtitle="Articles in your workspace"
				/>
				<MetricCard
					title="Published"
					value={publishedCountQuery.isPending ? "—" : String(published)}
					change="+4.2%"
					subtitle="Visible on the blog"
				/>
				<MetricCard
					title="Drafts"
					value={draftCountQuery.isPending ? "—" : String(drafts)}
					change="-2.1%"
					subtitle="Not yet published"
				/>
				<MetricCard
					title="Trend"
					value="4.5%"
					change="+4.5%"
					subtitle="Placeholder (wire analytics later)"
				/>
			</div>

			<AdminSurface innerClassName="p-6">
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-1">
						<div className="text-sm font-medium">Total Visitors</div>
						<div className="text-sm text-muted-foreground">
							Total for the last {range === "3m" ? "3 months" : range === "30d" ? "30 days" : "7 days"}
						</div>
					</div>
					<SegmentedControl
						value={range}
						onChange={setRange}
						options={[
							{ value: "3m", label: "Last 3 months" },
							{ value: "30d", label: "Last 30 days" },
							{ value: "7d", label: "Last 7 days" },
						]}
					/>
				</div>

				<div className="mt-6">
					<AreaChart values={visitors} />
				</div>
			</AdminSurface>

			<AdminSurface innerClassName="p-6">
				<div className="flex items-end justify-between gap-4">
					<div className="space-y-1">
						<div className="text-sm font-medium">Documents</div>
						<div className="text-sm text-muted-foreground">
							{latestQuery.isPending
								? "Loading..."
								: latestQuery.isError
									? "Failed to load"
									: "A table layout similar to the shadcn block."}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							className={buttonClassName({ variant: "outline", size: "sm" })}
						>
							Customize Columns
						</button>
						<Link
							to="/admin/articles/new"
							className={buttonClassName({ variant: "outline", size: "sm" })}
						>
							Add Section
						</Link>
					</div>
				</div>

				<div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="inline-flex items-center gap-1 rounded-md border bg-muted/30 p-1 text-sm">
						<TabButton
							active={tab === "outline"}
							onClick={() => setTab("outline")}
						>
							Outline
						</TabButton>
						<TabButton active={tab === "past"} onClick={() => setTab("past")}>
							Past Performance
						</TabButton>
						<TabButton active={tab === "people"} onClick={() => setTab("people")}>
							Key Personnel
						</TabButton>
						<TabButton active={tab === "focus"} onClick={() => setTab("focus")}>
							Focus Documents
						</TabButton>
					</div>
					<div className="text-xs text-muted-foreground">
						Tab: {tab}
					</div>
				</div>

				<div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="hidden md:table-cell">Updated</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{latest.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="py-10 text-center text-muted-foreground"
									>
										No articles yet. Create your first one.
									</TableCell>
								</TableRow>
							) : (
								latest.map((a) => (
									<TableRow key={a.id}>
										<TableCell>
											<div className="font-medium">{a.title}</div>
											<div className="text-xs text-muted-foreground">#{a.id}</div>
										</TableCell>
										<TableCell>
											<Badge variant={a.is_published ? "default" : "secondary"}>
												{a.is_published ? "Published" : "Draft"}
											</Badge>
										</TableCell>
										<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
											{a.updated_at}
										</TableCell>
										<TableCell className="text-right">
											<Link
												to="/admin/articles/$id"
												params={{ id: String(a.id) }}
												className={buttonClassName({
													variant: "outline",
													size: "sm",
												})}
											>
												Edit
											</Link>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</AdminSurface>
		</div>
	);
}

function MetricCard({
	title,
	value,
	change,
	subtitle,
}: {
	title: string;
	value: string;
	change: string;
	subtitle: string;
}) {
	return (
		<AdminSurface innerClassName="p-6">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<div className="text-sm text-muted-foreground">{title}</div>
					<div className="text-2xl font-semibold tracking-tight">{value}</div>
				</div>
				<div className="rounded-full border bg-background px-2 py-0.5 text-xs">
					{change}
				</div>
			</div>
			<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
				<TrendingUp className="h-3.5 w-3.5" />
				{subtitle}
			</div>
		</AdminSurface>
	);
}

function SegmentedControl<T extends string>({
	value,
	onChange,
	options,
}: {
	value: T;
	onChange: (next: T) => void;
	options: Array<{ value: T; label: string }>;
}) {
	return (
		<div className="inline-flex items-center rounded-md border border-border bg-muted/30 p-1 text-sm">
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={[
						"rounded-sm px-3 py-1 text-xs font-medium transition-colors",
						opt.value === value
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground",
					].join(" ")}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function AreaChart({ values }: { values: number[] }) {
	const width = 960;
	const height = 260;
	const padding = 8;

	const min = Math.min(...values);
	const max = Math.max(...values);
	const xStep = (width - padding * 2) / Math.max(1, values.length - 1);
	const scaleY = (v: number) => {
		const t = max === min ? 0.5 : (v - min) / (max - min);
		return height - padding - t * (height - padding * 2);
	};

	const points = values.map((v, i) => {
		const x = padding + i * xStep;
		const y = scaleY(v);
		return { x, y };
	});

	const path = points
		.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
		.join(" ");

	const areaPath = `${path} L${(padding + (values.length - 1) * xStep).toFixed(2)},${(height - padding).toFixed(2)} L${padding.toFixed(2)},${(height - padding).toFixed(2)} Z`;

	return (
		<div className="rounded-lg border border-border bg-background p-4">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="h-[240px] w-full"
				role="img"
				aria-label="Visitors chart"
			>
				<defs>
					<linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
						<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
					</linearGradient>
				</defs>

				<path d={areaPath} fill="url(#area)" />
				<path
					d={path}
					fill="none"
					stroke="hsl(var(--primary))"
					strokeWidth="2"
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				"rounded-sm px-3 py-1 text-xs font-medium transition-colors",
				active
					? "bg-background text-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground",
			].join(" ")}
		>
			{children}
		</button>
	);
}
