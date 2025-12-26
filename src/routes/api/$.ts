import { createFileRoute } from "@tanstack/react-router";
import { app as api } from "@/api";

// 创建 API 路由，捕获所有 /api/* 请求并转发给 Hono
export const Route = createFileRoute("/api/$")({
	server: {
		handlers: {
			GET: ({ request }) => api.fetch(request),
			POST: ({ request }) => api.fetch(request),
			PUT: ({ request }) => api.fetch(request),
			DELETE: ({ request }) => api.fetch(request),
			PATCH: ({ request }) => api.fetch(request),
		},
	},
});
