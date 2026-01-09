import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export type SearchItem = {
	id: number;
	title: string;
	summary: string;
};

export default function SearchModal({
	open,
	onClose,
	items,
}: {
	open: boolean;
	onClose: () => void;
	items: SearchItem[];
}) {
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!open) return;
		setQ("");
		const t = window.setTimeout(() => inputRef.current?.focus(), 0);
		return () => window.clearTimeout(t);
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, onClose]);

	const results = useMemo(() => {
		const query = q.toLowerCase().trim();
		if (!query) return [];
		return items.filter(
			(p) =>
				p.title.toLowerCase().includes(query) ||
				p.summary.toLowerCase().includes(query),
		);
	}, [items, q]);

	if (!open) return null;

	return (
		<div id="search-modal" className="fixed inset-0 z-50">
			<button
				type="button"
				className="modal-backdrop absolute inset-0 transition-opacity"
				aria-label="Close search"
				onClick={onClose}
			/>
			<div className="relative z-10 max-w-xl mx-auto mt-24 p-4">
				<div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
					<div className="flex items-center border-b border-gray-100 dark:border-gray-800 p-4">
						<svg
							className="w-5 h-5 text-gray-400 mr-3"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Search</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							ref={inputRef}
							id="search-input"
							type="text"
							placeholder="搜索文章..."
							className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
							autoComplete="off"
							value={q}
							onChange={(e) => setQ(e.target.value)}
						/>
					</div>
					<div id="search-results" className="max-h-[50vh] overflow-y-auto p-2">
						{q.trim().length === 0 ? null : results.length ? (
							results.map((p) => (
								<button
									key={p.id}
									type="button"
									onClick={() => {
										navigate({
											to: "/article/$id",
											params: { id: String(p.id) },
										});
										onClose();
									}}
									className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 w-full text-left"
								>
									<div className="text-sm font-bold text-gray-800 dark:text-gray-200">
										{p.title}
									</div>
								</button>
							))
						) : (
							<div className="text-center py-4 text-gray-400 text-xs">
								无结果
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
