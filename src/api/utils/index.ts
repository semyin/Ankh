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

type MockKVListResult = {
	keys: Array<{ name: string }>;
	list_complete: boolean;
	cursor: string;
};

class MockKV {
	private store = new Map<string, string>();

	async get(key: string): Promise<string | null> {
		return this.store.get(key) || null;
	}

	async put(
		key: string,
		value: string,
		_options?: { expirationTtl?: number },
	): Promise<void> {
		this.store.set(key, value);
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	async list(): Promise<MockKVListResult> {
		return {
			keys: Array.from(this.store.keys()).map((name) => ({ name })),
			list_complete: true,
			cursor: "",
		};
	}

	async getWithMetadata(): Promise<{ value: string | null; metadata: null }> {
		return { value: null, metadata: null };
	}
}

// Global Mock KV instance (only created once)
const mockKV = new MockKV();
let mockKVInitialized = false;

export const createApp = () => {
	const app = new Hono<{ Variables: Variables; Bindings: Bindings }>();

	// Inject Mock KV in development environments
	app.use("*", async (c, next) => {
		if (!c.env?.KV) {
			// @ts-expect-error - Hono bindings are not defined locally
			c.env = c.env || {};
			// @ts-expect-error - attach mock KV for development
			c.env.KV = mockKV;

			if (!mockKVInitialized) {
				console.log("[mock-kv] Using Mock KV in development mode");
				mockKVInitialized = true;
			}
		}
		await next();
	});

	return app;
};
