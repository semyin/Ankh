/// <reference types="vite/client" />

interface ImportMetaEnv {
	// Client-side environment variables
	readonly VITE_APP_NAME: string;
	readonly VITE_API_URL: string;
}

export interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Server-side environment variables
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly DATABASE_URL: string;
			readonly SUPABASE_URL: string;
			readonly SUPABASE_KEY: string;
			readonly SUPABASE_BUCKET_NAME: string;
			readonly DEEPSEEK_API_KEY: string;
			readonly DEEPSEEK_API_URL: string;
			readonly HOST: string;
		}
	}
}
