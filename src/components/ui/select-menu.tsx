import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SelectMenuOption = {
	value: string;
	label: string;
	keywords?: string;
	disabled?: boolean;
};

function normalizeSearch(value: string) {
	return value.trim().toLowerCase();
}

function useOutsideClick(
	open: boolean,
	refs: Array<React.RefObject<HTMLElement | null>>,
	onOutsideClick: () => void,
) {
	React.useEffect(() => {
		if (!open) return;

		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			for (const ref of refs) {
				if (ref.current && ref.current.contains(target)) return;
			}
			onOutsideClick();
		};

		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open, refs, onOutsideClick]);
}

export function SelectMenu({
	value,
	onValueChange,
	options,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyText = "No results.",
	disabled,
	className,
	triggerClassName,
	contentClassName,
}: {
	value: string;
	onValueChange: (value: string) => void;
	options: SelectMenuOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	contentClassName?: string;
}) {
	const triggerRef = React.useRef<HTMLButtonElement | null>(null);
	const contentRef = React.useRef<HTMLDivElement | null>(null);

	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");

	const selected = React.useMemo(
		() => options.find((opt) => opt.value === value) ?? null,
		[options, value],
	);

	const filteredOptions = React.useMemo(() => {
		const q = normalizeSearch(query);
		if (!q) return options;
		return options.filter((opt) => {
			const haystack = normalizeSearch(
				`${opt.label} ${opt.keywords ?? ""} ${opt.value}`,
			);
			return haystack.includes(q);
		});
	}, [options, query]);

	useOutsideClick(open, [triggerRef, contentRef], () => setOpen(false));

	return (
		<div className={cn("relative", className)}>
			<button
				ref={triggerRef}
				type="button"
				disabled={disabled}
				onClick={() => setOpen((v) => !v)}
				onKeyDown={(e) => {
					if (e.key === "Escape") setOpen(false);
				}}
				className={cn(
					"flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
					"disabled:cursor-not-allowed disabled:opacity-50",
					triggerClassName,
				)}
			>
				<span
					className={cn(
						"truncate text-left",
						selected ? "text-foreground" : "text-muted-foreground",
					)}
				>
					{selected ? selected.label : placeholder}
				</span>
				<ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
			</button>

			{open ? (
				<div
					ref={contentRef}
					className={cn(
						"absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
						contentClassName,
					)}
				>
					<div className="flex items-center gap-2 border-b border-border p-2">
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={searchPlaceholder}
							className="h-8"
							autoFocus
						/>
						<button
							type="button"
							className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
							onClick={() => setOpen(false)}
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<div className="max-h-72 overflow-auto p-1">
						{filteredOptions.length === 0 ? (
							<div className="px-2 py-3 text-sm text-muted-foreground">
								{emptyText}
							</div>
						) : (
							filteredOptions.map((opt) => {
								const active = opt.value === value;
								return (
									<button
										key={opt.value}
										type="button"
										disabled={opt.disabled}
										onClick={() => {
											onValueChange(opt.value);
											setOpen(false);
										}}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
											"hover:bg-accent hover:text-accent-foreground",
											"disabled:pointer-events-none disabled:opacity-50",
											active ? "bg-accent text-accent-foreground" : "",
										)}
									>
										<span className="truncate text-left">{opt.label}</span>
										{active ? <Check className="h-4 w-4" /> : null}
									</button>
								);
							})
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}

export function MultiSelectMenu({
	values,
	onValuesChange,
	options,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyText = "No results.",
	disabled,
	className,
	triggerClassName,
	contentClassName,
}: {
	values: string[];
	onValuesChange: (values: string[]) => void;
	options: SelectMenuOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	contentClassName?: string;
}) {
	const triggerRef = React.useRef<HTMLButtonElement | null>(null);
	const contentRef = React.useRef<HTMLDivElement | null>(null);

	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");

	const selectedSet = React.useMemo(() => new Set(values), [values]);
	const selectedOptions = React.useMemo(
		() => options.filter((opt) => selectedSet.has(opt.value)),
		[options, selectedSet],
	);

	const triggerLabel = React.useMemo(() => {
		if (selectedOptions.length === 0) return placeholder;
		if (selectedOptions.length <= 2)
			return selectedOptions.map((opt) => opt.label).join(", ");
		return `${selectedOptions[0]?.label ?? ""}, ${selectedOptions[1]?.label ?? ""} +${
			selectedOptions.length - 2
		}`;
	}, [placeholder, selectedOptions]);

	const filteredOptions = React.useMemo(() => {
		const q = normalizeSearch(query);
		if (!q) return options;
		return options.filter((opt) => {
			const haystack = normalizeSearch(
				`${opt.label} ${opt.keywords ?? ""} ${opt.value}`,
			);
			return haystack.includes(q);
		});
	}, [options, query]);

	const toggle = (nextValue: string) => {
		const next = new Set(values);
		if (next.has(nextValue)) next.delete(nextValue);
		else next.add(nextValue);
		onValuesChange(Array.from(next));
	};

	useOutsideClick(open, [triggerRef, contentRef], () => setOpen(false));

	return (
		<div className={cn("relative", className)}>
			<div className="flex items-center gap-2">
				<button
					ref={triggerRef}
					type="button"
					disabled={disabled}
					onClick={() => setOpen((v) => !v)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setOpen(false);
					}}
					className={cn(
						"flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
						"disabled:cursor-not-allowed disabled:opacity-50",
						triggerClassName,
					)}
				>
					<span
						className={cn(
							"truncate text-left",
							values.length ? "text-foreground" : "text-muted-foreground",
						)}
					>
						{triggerLabel}
					</span>
					<div className="flex items-center gap-2">
						{values.length ? (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
								{values.length}
							</span>
						) : null}
						<ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
					</div>
				</button>
			</div>

			{open ? (
				<div
					ref={contentRef}
					className={cn(
						"absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
						contentClassName,
					)}
				>
					<div className="flex items-center gap-2 border-b border-border p-2">
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={searchPlaceholder}
							className="h-8"
							autoFocus
						/>
						<button
							type="button"
							className={cn(
								"inline-flex h-8 items-center justify-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors",
								"hover:bg-accent hover:text-foreground",
								values.length ? "" : "pointer-events-none opacity-50",
							)}
							onClick={() => onValuesChange([])}
						>
							Clear
						</button>
						<button
							type="button"
							className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
							onClick={() => setOpen(false)}
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<div className="max-h-72 overflow-auto p-1">
						{filteredOptions.length === 0 ? (
							<div className="px-2 py-3 text-sm text-muted-foreground">
								{emptyText}
							</div>
						) : (
							filteredOptions.map((opt) => {
								const active = selectedSet.has(opt.value);
								return (
									<button
										key={opt.value}
										type="button"
										disabled={opt.disabled}
										onClick={() => toggle(opt.value)}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
											"hover:bg-accent hover:text-accent-foreground",
											"disabled:pointer-events-none disabled:opacity-50",
											active ? "bg-accent text-accent-foreground" : "",
										)}
									>
										<span className="truncate text-left">{opt.label}</span>
										{active ? <Check className="h-4 w-4" /> : null}
									</button>
								);
							})
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
