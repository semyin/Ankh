import { useEffect, useId, useMemo, useState } from "react";

function pad2(n: number) {
	return String(n).padStart(2, "0");
}

export default function RealtimeCard() {
	const [now, setNow] = useState(() => new Date());
	const tzId = useId();
	const timeId = useId();
	const dateId = useId();

	useEffect(() => {
		const id = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(id);
	}, []);

	const tzText = useMemo(() => {
		const offsetMin = -new Date().getTimezoneOffset();
		const sign = offsetMin >= 0 ? "+" : "-";
		const offsetAbs = Math.abs(offsetMin);
		const offsetStr = `UTC${sign}${pad2(Math.floor(offsetAbs / 60))}:${pad2(
			offsetAbs % 60,
		)}`;
		const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
		return tzName ? `${tzName} · ${offsetStr}` : offsetStr;
	}, []);

	const timeText = useMemo(
		() =>
			new Intl.DateTimeFormat("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).format(now),
		[now],
	);

	const dateText = useMemo(
		() =>
			new Intl.DateTimeFormat("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				weekday: "short",
			}).format(now),
		[now],
	);

	return (
		<div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
			<div className="flex items-center justify-between">
				<h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
					实时信息
				</h4>
				<span id={tzId} className="text-[10px] text-gray-400">
					{tzText}
				</span>
			</div>
			<div className="mt-3">
				<div
					id={timeId}
					className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums"
				>
					{timeText}
				</div>
				<div
					id={dateId}
					className="mt-1 text-xs text-gray-500 dark:text-gray-400"
				>
					{dateText}
				</div>
			</div>
		</div>
	);
}
