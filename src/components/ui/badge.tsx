import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const variantClass: Record<BadgeVariant, string> = {
	default: "bg-primary text-primary-foreground hover:bg-primary/90",
	secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	outline: "border border-input bg-background text-foreground",
	destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export function Badge({
	className,
	variant = "default",
	...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
				"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				variantClass[variant],
				className,
			)}
			{...props}
		/>
	);
}
