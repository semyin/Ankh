# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 TanStack Start 的全栈博客应用，使用 Supabase 作为数据库后端，Nitro 作为服务端运行时。项目集成了 TanStack Router（文件路由）、TanStack Query（数据获取）、Hono（API 框架）和 Tailwind CSS（样式）。

## Development Commands

```bash
npm run dev          # 启动开发服务器（端口 3000）
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run test         # 运行 Vitest 测试
npm run lint         # 使用 Biome 进行代码检查
npm run format       # 使用 Biome 格式化代码
npm run check        # 运行 Biome 的完整检查
npm run deploy       # 构建并部署到 Cloudflare Workers
```

## Architecture

### 路由系统
- 使用 **TanStack Router** 的文件路由系统
- 路由文件位于 `src/routes/` 目录
- `src/routes/__root.tsx` 是根布局，包含 Header 和 devtools
- `src/routeTree.gen.ts` 是自动生成的路由树文件（不要手动编辑）
- 路由器配置在 `src/router.tsx`，集成了 TanStack Query 的 SSR 支持

### 数据获取
- **TanStack Query** 集成在 `src/integrations/tanstack-query/` 目录
- `root-provider.tsx` 导出 `getContext()` 和 `Provider` 组件
- Router 通过 context 共享 QueryClient 实例
- 使用 `setupRouterSsrQueryIntegration` 实现 SSR 数据同步

### API 路由（Hono）
- 使用 **Hono** 作为后端 API 框架
- `src/api/index.ts` 是 API 路由入口，配置中间件和挂载路由
- `src/routes/api/$.ts` 是 catch-all 路由，将 `/api/*` 请求转发给 Hono
- API 路由模块按功能组织在 `src/api/` 目录下（如 `article/`、`auth/`、`category/` 等）
- 每个模块包含 `*.route.ts` 文件定义路由
- 内置中间件：logger（`src/api/middleware/logger.ts`）
- 工具函数：`src/api/utils/`（分页、响应格式化等）
- 添加新 API：在 `src/api/` 创建模块目录和路由文件，然后在 `src/api/index.ts` 中挂载

### 样式
- 使用 **Tailwind CSS v4**（通过 Vite 插件）
- 全局样式在 `src/styles.css`

### 数据库（Supabase）
- 使用 **Supabase** 作为后端数据库
- `src/api/supabase/index.ts` 包含数据库类型定义和初始化函数
- 数据表：article、category、tag、article_tag、profile、friend_link、meta、brief
- API 路由通过中间件自动注入 Supabase 客户端到 Hono context
- 环境变量：`SUPABASE_URL`、`SUPABASE_KEY`

### 部署
- 当前使用 **Nitro** 作为服务端运行时
- Cloudflare Workers 部署配置已准备（`wrangler.jsonc`），但暂时禁用
- 入口点：`@tanstack/react-start/server-entry`

### Vite 配置
- 使用 `vite-tsconfig-paths` 支持 TypeScript 路径别名
- 集成 TanStack Devtools
- 支持 SSR 和客户端渲染

## Demo Files

`src/routes/demo/` 和 `src/data/demo.punk-songs.ts` 中的文件是演示文件，可以安全删除。

## Key Files

- `src/router.tsx` - 路由器配置和 Query 集成
- `src/routes/__root.tsx` - 根布局和 HTML 结构
- `src/integrations/tanstack-query/root-provider.tsx` - Query Client 配置
- `src/api/index.ts` - API 路由入口和中间件配置
- `src/api/supabase/index.ts` - Supabase 客户端和数据库类型定义
- `vite.config.ts` - Vite 和插件配置
