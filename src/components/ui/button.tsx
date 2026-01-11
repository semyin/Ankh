import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
	| "default"
	| "secondary"
	| "outline"
	| "ghost"
	| "destructive"
	| "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
	default: "bg-primary text-primary-foreground hover:bg-primary/90",
	secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	outline:
		"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
	ghost: "hover:bg-accent hover:text-accent-foreground",
	destructive:
		"bg-destructive text-destructive-foreground hover:bg-destructive/90",
	link: "text-primary underline-offset-4 hover:underline",
};

const sizeClass: Record<ButtonSize, string> = {
	default: "h-9 px-4 py-2",
	sm: "h-8 rounded-md px-3 text-xs",
	lg: "h-10 rounded-md px-8",
	icon: "h-9 w-9",
};

export function buttonClassName({
	variant = "default",
	size = "default",
	className,
}: {
	variant?: ButtonVariant;
	size?: ButtonSize;
	className?: string;
}) {
	return cn(
		"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
		"disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
		variantClass[variant],
		sizeClass[size],
		className,
	);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={buttonClassName({ variant, size, className })}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";
