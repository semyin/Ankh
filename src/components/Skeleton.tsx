import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className = "", ...props }: SkeletonProps) {
	return (
		<div
			aria-hidden="true"
			className={[
				"animate-pulse rounded bg-gray-200/70 dark:bg-gray-800/60",
				className,
			].join(" ")}
			{...props}
		/>
	);
}

