import type { KVNamespace } from "@cloudflare/workers-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import type { Database } from "@/api/supabase";

type Variables = {
	supabase: SupabaseClient<Database>;
};

type Bindings = {
	KV: KVNamespace;
};

// Mock KV for development
class MockKV {
	private store = new Map<string, string>();

	async get(key: string): Promise<string | null> {
		return this.store.get(key) || null;
	}

	async put(
		key: string,
		value: string,
		options?: { expirationTtl?: number },
	): Promise<void> {
		this.store.set(key, value);
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	async list(): Promise<any> {
		return {
			keys: Array.from(this.store.keys()).map((name) => ({ name })),
			list_complete: true,
			cursor: "",
		};
	}

	async getWithMetadata() {
		return { value: null, metadata: null };
	}
}

// 全局 Mock KV 实例（只创建一次）
const mockKV = new MockKV();
let mockKVInitialized = false;

export const createApp = () => {
	const app = new Hono<{ Variables: Variables; Bindings: Bindings }>();

	// 在开发环境中注入 Mock KV
	app.use("*", async (c, next) => {
		if (!c.env?.KV) {
			// @ts-ignore
			c.env = c.env || {};
			// @ts-ignore
			c.env.KV = mockKV;

			if (!mockKVInitialized) {
				console.log("✓ Using Mock KV in development mode");
				mockKVInitialized = true;
			}
		}
		await next();
	});

	return app;
};
