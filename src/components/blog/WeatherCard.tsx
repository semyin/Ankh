import { useEffect, useRef, useState } from "react";

type LocationInfo = {
	name: string;
	displayName?: string;
	latitude: number;
	longitude: number;
};

type WeatherCurrent = {
	temperature_2m: number;
	apparent_temperature?: number;
	weather_code: number;
	wind_speed_10m?: number;
};

type WeatherResponse = {
	current?: WeatherCurrent;
};

function weatherCodeText(code: number) {
	const map: Record<number, string> = {
		0: "晴",
		1: "大部晴朗",
		2: "多云",
		3: "阴",
		45: "雾",
		48: "雾（沉积）",
		51: "毛毛雨（小）",
		53: "毛毛雨（中）",
		55: "毛毛雨（大）",
		56: "冻毛毛雨（小）",
		57: "冻毛毛雨（大）",
		61: "小雨",
		63: "中雨",
		65: "大雨",
		66: "冻雨（小）",
		67: "冻雨（大）",
		71: "小雪",
		73: "中雪",
		75: "大雪",
		77: "雪粒",
		80: "阵雨（小）",
		81: "阵雨（中）",
		82: "阵雨（大）",
		85: "阵雪（小）",
		86: "阵雪（大）",
		95: "雷暴",
		96: "雷暴（冰雹）",
		99: "强雷暴（冰雹）",
	};
	return map[code] ?? `天气代码 ${code}`;
}

function safeJsonParse<T>(value: string | null): T | null {
	if (!value) return null;
	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
}

export default function WeatherCard() {
	const [status, setStatus] = useState(
		"可查询城市天气；定位需在 http://localhost 或 https 环境",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [location, setLocation] = useState<LocationInfo | null>(null);
	const [temperature, setTemperature] = useState("--°");
	const [desc, setDesc] = useState("—");
	const [meta, setMeta] = useState("—");
	const [inputValue, setInputValue] = useState("");

	const controllerRef = useRef<AbortController | null>(null);
	const isLoadingRef = useRef(false);

	const locationKey = (loc: LocationInfo) =>
		`${Number(loc.latitude).toFixed(2)},${Number(loc.longitude).toFixed(2)}`;

	useEffect(() => {
		isLoadingRef.current = isLoading;
	}, [isLoading]);

	useEffect(() => {
		const saved = safeJsonParse<LocationInfo>(
			localStorage.getItem("weatherLocation"),
		);
		if (!saved) {
			setStatus("输入城市查询，或使用定位");
			return;
		}
		setLocation(saved);
		setInputValue(saved.name || saved.displayName || "");
		void loadWeather(saved);
	}, []);

	const fetchJson = async <T,>(url: string, signal: AbortSignal) => {
		const res = await fetch(url, { signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as T;
	};

	const renderWeather = (data: WeatherResponse, loc: LocationInfo) => {
		const current = data.current;
		if (!current) throw new Error("无效的天气数据");

		const temp = Math.round(current.temperature_2m);
		const feels =
			typeof current.apparent_temperature === "number"
				? Math.round(current.apparent_temperature)
				: null;
		const wind =
			typeof current.wind_speed_10m === "number"
				? Math.round(current.wind_speed_10m)
				: null;
		const code = current.weather_code;

		setTemperature(`${temp}°`);
		setDesc(weatherCodeText(code));

		const parts: string[] = [];
		if (feels !== null) parts.push(`体感 ${feels}°`);
		if (wind !== null) parts.push(`风 ${wind} m/s`);
		const now = new Date();
		parts.push(
			`更新于 ${now.toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
			})}`,
		);
		setMeta(parts.join(" · "));

		localStorage.setItem(
			"weatherCache",
			JSON.stringify({ key: locationKey(loc), ts: Date.now(), data }),
		);
		localStorage.setItem("weatherLocation", JSON.stringify(loc));
	};

	const loadWeather = async (loc: LocationInfo, opts?: { force?: boolean }) => {
		const force = opts?.force ?? false;
		setLocation(loc);

		const key = locationKey(loc);
		const cache = safeJsonParse<{
			key: string;
			ts: number;
			data: WeatherResponse;
		}>(localStorage.getItem("weatherCache"));
		const maxAgeMs = 15 * 60 * 1000;

		if (
			!force &&
			cache &&
			cache.key === key &&
			Date.now() - cache.ts < maxAgeMs
		) {
			try {
				renderWeather(cache.data, loc);
				setStatus("使用缓存数据（15 分钟内）");
				return;
			} catch {}
		}

		if (controllerRef.current) controllerRef.current.abort();
		controllerRef.current = new AbortController();

		setIsLoading(true);
		setStatus("获取天气中…");
		try {
			const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
				loc.latitude,
			)}&longitude=${encodeURIComponent(
				loc.longitude,
			)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
			const data = await fetchJson<WeatherResponse>(
				url,
				controllerRef.current.signal,
			);
			renderWeather(data, loc);
			setStatus("获取成功");
		} catch (e: any) {
			setStatus(`获取失败：${e?.message || "未知错误"}`);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!location) return;

		const refreshIntervalMs = 5 * 60 * 1000;
		const id = window.setInterval(() => {
			if (document.visibilityState !== "visible") return;
			if (isLoadingRef.current) return;
			void loadWeather(location, { force: true });
		}, refreshIntervalMs);

		return () => window.clearInterval(id);
	}, [location]);

	const resolveCity = async (name: string) => {
		if (controllerRef.current) controllerRef.current.abort();
		controllerRef.current = new AbortController();
		const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
			name,
		)}&count=1&language=zh&format=json`;
		const data = await fetchJson<any>(url, controllerRef.current.signal);
		const first = data?.results?.[0];
		if (!first) throw new Error("未找到城市");
		const parts = [first.name, first.admin1, first.country].filter(Boolean);
		return {
			name: first.name,
			displayName: parts.join(" · "),
			latitude: first.latitude,
			longitude: first.longitude,
		} satisfies LocationInfo;
	};

	const onSearch = async () => {
		const name = String(inputValue || "").trim();
		if (!name) return setStatus("请输入城市名（例如：北京）");

		setIsLoading(true);
		setStatus("查询城市中…");
		try {
			const loc = await resolveCity(name);
			await loadWeather(loc, { force: true });
		} catch (e: any) {
			setStatus(`查询失败：${e?.message || "未知错误"}`);
		} finally {
			setIsLoading(false);
		}
	};

	const onRefresh = async () => {
		if (location) return loadWeather(location, { force: true });
		return onSearch();
	};

	const onGeolocate = () => {
		if (!window.isSecureContext) {
			setStatus(
				"定位需要 https 或 http://localhost 环境（建议用 py -m http.server）",
			);
			return;
		}
		if (!navigator.geolocation) {
			setStatus("当前浏览器不支持定位");
			return;
		}

		setIsLoading(true);
		setStatus("获取定位中…");
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const loc: LocationInfo = {
					name: "当前位置",
					displayName: "当前位置",
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
				};
				await loadWeather(loc, { force: true });
				setIsLoading(false);
			},
			(err) => {
				setStatus(`定位失败：${(err as any)?.message || "未知错误"}`);
				setIsLoading(false);
			},
			{ enableHighAccuracy: true, timeout: 10000 },
		);
	};

	return (
		<div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
			<div className="flex items-center justify-between gap-3">
				<h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
					天气
				</h4>
				<button
					id="weather-refresh"
					type="button"
					disabled={isLoading}
					onClick={onRefresh}
					className="text-[10px] px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors disabled:opacity-60"
				>
					刷新
				</button>
			</div>
			<div className="mt-3 flex gap-2">
				<input
					id="weather-city-input"
					type="text"
					placeholder="输入城市，如 北京"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") onSearch();
					}}
					className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 outline-none focus:ring-2 focus:ring-blue-500/30"
				/>
				<button
					id="weather-search"
					type="button"
					disabled={isLoading}
					onClick={onSearch}
					className="text-xs px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
				>
					查询
				</button>
			</div>
			<div className="mt-4 flex items-start justify-between gap-3">
				<div>
					<div
						id="weather-location"
						className="text-xs font-medium text-gray-900 dark:text-white"
					>
						{location?.displayName || location?.name || "—"}
					</div>
					<div
						id="weather-desc"
						className="mt-1 text-xs text-gray-500 dark:text-gray-400"
					>
						{desc}
					</div>
					<div id="weather-meta" className="mt-1 text-[10px] text-gray-400">
						{meta}
					</div>
				</div>
				<div
					id="weather-temp"
					className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums"
				>
					{temperature}
				</div>
			</div>
			<div id="weather-status" className="mt-3 text-[10px] text-gray-400">
				{status}
			</div>
			<div className="mt-3">
				<button
					id="weather-geolocate"
					type="button"
					disabled={isLoading}
					onClick={onGeolocate}
					className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
				>
					使用定位
				</button>
			</div>
		</div>
	);
}
