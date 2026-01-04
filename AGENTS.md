# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains all application code.
  - `src/routes/` is TanStack Router file-based routing (`src/routes/__root.tsx` is the shared layout).
  - `src/api/` is the Hono API, organized by feature (e.g. `src/api/article/`, `src/api/auth/`). Requests to `/api/*` are forwarded via `src/routes/api/$.ts`.
  - `src/integrations/` holds framework integrations (e.g. TanStack Query in `src/integrations/tanstack-query/`).
  - `src/components/` shared UI components; `src/styles.css` global styles (Tailwind v4).
- `public/` is for static assets served as-is.
- `dist/` and `.output/` are build outputs; do not edit by hand.
- `wrangler.toml` contains Cloudflare Workers deployment configuration.

## Build, Test, and Development Commands

- `npm run dev` — start the local dev server (port `3000`).
- `npm run build` — create a production build.
- `npm run preview` — serve the production build locally.
- `npm run test` — run Vitest in CI mode (`vitest run`).
- `npm run lint` / `npm run format` / `npm run check` — Biome lint/format/full check.
- `npm run deploy` — build and deploy to Cloudflare Workers via Wrangler.

## Coding Style & Naming Conventions

- Language: TypeScript + React (ESM).
- Formatting/linting: Biome (`biome.json`) with **tab** indentation and double quotes.
- Imports: prefer path aliases where appropriate (e.g. `@/components/Header` via `tsconfig.json`).
- Routes: add new pages as files in `src/routes/` (avoid editing generated `src/routeTree.gen.ts`).

## Testing Guidelines

- Framework: Vitest (with Testing Library available).
- Naming: place tests alongside code as `*.test.ts` / `*.test.tsx` (e.g. `src/api/utils/response.test.ts`).
- Run: `npm run test` (consider adding focused runs locally: `npx vitest -t "name"`).

## Commit & Pull Request Guidelines

- Commit messages follow Conventional Commits (examples seen in history): `feat(api): ...`, `docs: ...`, `chore: ...`.
- PRs should include: a clear description, linked issue (if any), testing notes (`npm run test`/`npm run check`), and screenshots for UI changes.

## Configuration & Secrets

- Use `.env.example` as the template; never commit real secrets.
- Supabase requires `SUPABASE_URL` and `SUPABASE_KEY` (used by the API layer).

---

# 仓库指南（中文）

## 项目结构与模块组织

- `src/`：全部业务代码。
  - `src/routes/`：TanStack Router 文件路由（`src/routes/__root.tsx` 为全局布局）。
  - `src/api/`：Hono API，按业务域拆分（如 `src/api/article/`、`src/api/auth/`）。`/api/*` 由 `src/routes/api/$.ts` 转发。
  - `src/integrations/`：框架/库集成（如 `src/integrations/tanstack-query/`）。
  - `src/components/`：可复用组件；`src/styles.css`：全局样式（Tailwind v4）。
- `public/`：静态资源目录（原样输出）。
- `dist/`、`.output/`：构建产物目录，请勿手动修改。
- `wrangler.toml`：Cloudflare Workers 部署配置。

## 构建、测试与开发命令

- `npm run dev`：启动本地开发服务器（端口 `3000`）。
- `npm run build`：生成生产构建。
- `npm run preview`：本地预览生产构建结果。
- `npm run test`：以 CI 模式运行 Vitest（`vitest run`）。
- `npm run lint` / `npm run format` / `npm run check`：Biome 代码检查/格式化/全量检查。
- `npm run deploy`：构建并通过 Wrangler 部署到 Cloudflare Workers。

## 代码风格与命名约定

- 技术栈：TypeScript + React（ESM）。
- 代码规范：Biome（`biome.json`），使用**制表符**缩进、双引号字符串。
- 导入路径：优先使用别名（`tsconfig.json` 中 `@/* -> ./src/*`），例如 `@/components/Header`。
- 路由约定：页面/路由文件放在 `src/routes/`；不要手改生成文件 `src/routeTree.gen.ts`。

## 测试指南

- 测试框架：Vitest（已包含 Testing Library 依赖）。
- 命名与位置：建议就近放置 `*.test.ts` / `*.test.tsx`（例如 `src/api/utils/response.test.ts`）。
- 运行：`npm run test`；本地可按用例过滤：`npx vitest -t "用例名"`。

## 提交与 Pull Request 规范

- 提交信息：遵循 Conventional Commits（历史示例：`feat(api): ...`、`docs: ...`、`chore: ...`）。
- PR 要求：清晰描述变更、关联 Issue（如有）、说明测试情况（`npm run test`/`npm run check`），UI 变更附截图/录屏。

## 配置与密钥

- 以 `.env.example` 为模板；不要提交真实密钥或生产配置。
- Supabase 需要 `SUPABASE_URL` 与 `SUPABASE_KEY`（供 API 层使用）。
