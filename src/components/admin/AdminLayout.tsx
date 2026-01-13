import type * as React from "react";
import { cn } from "@/lib/utils";

export function AdminContainer({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("mx-auto w-full max-w-7xl", className)} {...props} />
	);
}

export function AdminPageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: string;
	actions?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div className="space-y-1">
				<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
					{title}
				</h1>
				{description ? (
					<p className="text-sm md:text-base text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex items-center gap-2">{actions}</div>
			) : null}
		</div>
	);
}

export function AdminSurface({
	className,
	innerClassName,
	children,
}: {
	className?: string;
	innerClassName?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"rounded-xl border border-border bg-card text-card-foreground shadow-sm",
				className,
			)}
		>
			<div className={cn("rounded-xl p-0", innerClassName)}>{children}</div>
		</div>
	);
}
