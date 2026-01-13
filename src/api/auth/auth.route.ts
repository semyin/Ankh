export { app as authRoute };

import { deleteCookie, setCookie } from "hono/cookie";
import { createApp } from "@/api/utils";
import { result } from "@/api/utils/response";

const app = createApp();

app.post("/login", async (c) => {
	const supabase = c.get("supabase");
	const body = await c.req.json<{ email: string; password: string }>();

	const { data, error } = await supabase.auth.signInWithPassword({
		email: body.email,
		password: body.password,
	});

	if (error) {
		return result.error(c, error.message || "Login failed", 401);
	}

	setCookie(c, "access_token", data.session.access_token, {
		httpOnly: true,
		secure: !!import.meta.env.PROD,
		maxAge: data.session.expires_in,
	});

	return result.from(c, { data, error });
});

app.post("/logout", async (c) => {
	deleteCookie(c, "access_token");
	return result.ok(c, null, "退出成功");
});

app.get("/me", async (c) => {
	const supabase = c.get("supabase");
	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		return result.error(c, error?.message || "Unauthorized", 401);
	}

	return result.ok(c, data.user);
});
