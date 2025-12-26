import type { Context } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import todos from "../routes-api/todos";

// 创建 Hono 应用实例
const app = new Hono();

// 中间件
app.use("*", logger());
app.use("/api/*", cors());

// 健康检查
app.get("/api/health", (c: Context) => {
	return c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		service: "ankh-api",
	});
});

// 欢迎路由
app.get("/api/hello", (c: Context) => {
	const name = c.req.query("name") || "World";
	return c.json({
		message: `Hello ${name} from Hono!`,
		powered_by: "Hono + Cloudflare Workers",
	});
});

// 示例 POST 路由
app.post("/api/echo", async (c: Context) => {
	const body = await c.req.json();
	return c.json({
		received: body,
		timestamp: new Date().toISOString(),
	});
});

// 用户相关路由示例
app.get("/api/users/:id", (c: Context) => {
	const id = c.req.param("id");
	return c.json({
		id,
		name: `User ${id}`,
		email: `user${id}@example.com`,
	});
});

// 挂载 todos 路由
app.route("/api/todos", todos);

// 404 处理
app.notFound((c: Context) => {
	return c.json({ error: "Not Found", path: c.req.path }, 404);
});

// 错误处理
app.onError((err, c: Context) => {
	console.error(`Error: ${err.message}`);
	return c.json({ error: err.message }, 500);
});

// 导出 Hono 应用
export { app };
