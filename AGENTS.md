# Repository Guidelines

## Project Structure & Module Organization

- `src/`: application code.
  - `src/routes/`: TanStack Router file-based routes (`src/routes/__root.tsx` is the shared layout). Avoid editing generated `src/routeTree.gen.ts`.
  - `src/api/`: Hono API organized by feature (e.g. `src/api/auth/`, `src/api/article/`). Requests to `/api/*` are forwarded via `src/routes/api/$.ts`.
  - `src/integrations/`: framework integrations (e.g. TanStack Query).
  - `src/components/`: shared UI components.
  - `src/styles.css`: global styles (Tailwind v4).
- `public/`: static assets served as-is.
- `dist/` and `.output/`: build outputs (do not edit).
- `wrangler.toml`: Cloudflare Workers deployment config.

## Build, Test, and Development Commands

- `npm run dev`: start local dev server on port `3000`.
- `npm run build`: create a production build.
- `npm run preview`: serve the production build locally.
- `npm run test`: run Vitest in CI mode (`vitest run`).
- `npm run lint` / `npm run format` / `npm run check`: Biome lint/format/full check.
- `npm run deploy`: build and deploy to Cloudflare Workers via Wrangler.

## Coding Style & Naming Conventions

- Language: TypeScript + React (ESM).
- Formatting/linting: Biome (`biome.json`) with **tab** indentation and double quotes.
- Imports: prefer path aliases where appropriate (e.g. `@/components/Header` via `tsconfig.json`).
- Routes: add pages by creating files in `src/routes/`.

## Testing Guidelines

- Framework: Vitest (Testing Library available).
- Naming: place tests near code as `*.test.ts` / `*.test.tsx` (e.g. `src/api/utils/response.test.ts`).

## Commit & Pull Request Guidelines

- Commits: follow Conventional Commits (e.g. `feat(api): ...`, `docs: ...`, `chore: ...`).
- PRs: include a clear description, linked issue (if any), testing notes (`npm run test`, `npm run check`), and screenshots/recordings for UI changes.

## Security & Configuration Tips

- Use `.env.example` as the template; never commit real secrets.
- Supabase requires `SUPABASE_URL` and `SUPABASE_KEY` for the API layer.

---

## 仓库指南（中文）

### 项目结构与模块组织

- `src/`：全部业务代码。
  - `src/routes/`：TanStack Router 文件路由（`src/routes/__root.tsx` 为全局布局）；不要手改生成的 `src/routeTree.gen.ts`。
  - `src/api/`：Hono API，按业务域拆分（如 `src/api/auth/`、`src/api/article/`）；`/api/*` 由 `src/routes/api/$.ts` 转发。
  - `src/integrations/`：框架/库集成（如 TanStack Query）。
  - `src/components/`：可复用组件；`src/styles.css`：全局样式（Tailwind v4）。
- `public/`：静态资源目录；`dist/`、`.output/`：构建产物（勿手改）；`wrangler.toml`：Cloudflare Workers 部署配置。

### 构建、测试与开发命令

- `npm run dev`：启动本地开发（端口 `3000`）。
- `npm run build` / `npm run preview`：生产构建 / 本地预览。
- `npm run test`：Vitest（CI 模式：`vitest run`）。
- `npm run lint` / `npm run format` / `npm run check`：Biome 检查/格式化/全量检查。
- `npm run deploy`：构建并通过 Wrangler 部署。

### 代码风格与命名约定

- 技术栈：TypeScript + React（ESM）。
- 规范工具：Biome（tab 缩进、双引号）。
- 导入：优先使用别名（`@/* -> ./src/*`）。
- 路由：新增页面直接在 `src/routes/` 添加文件。

### 测试指南

- 框架：Vitest（可用 Testing Library）。
- 命名：就近放置 `*.test.ts` / `*.test.tsx`，运行 `npm run test`。

### 提交与 Pull Request

- 提交信息：Conventional Commits（示例：`feat(api): ...`、`docs: ...`、`chore: ...`）。
- PR：说明变更与原因、关联 Issue（如有）、测试结果（`npm run test`/`npm run check`），UI 变更附截图/录屏。

### 安全与配置

- 以 `.env.example` 为模板；不要提交真实密钥。
- Supabase：`SUPABASE_URL`、`SUPABASE_KEY`（API 层使用）。
