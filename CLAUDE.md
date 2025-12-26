# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 TanStack Start 的全栈 React 应用，使用 Cloudflare Workers 进行部署。项目集成了 TanStack Router（文件路由）、TanStack Query（数据获取）和 Tailwind CSS（样式）。

## Development Commands

### 开发和构建
```bash
npm run dev          # 启动开发服务器（端口 3000）
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run deploy       # 构建并部署到 Cloudflare Workers
```

### 测试
```bash
npm run test         # 运行 Vitest 测试
```

### 代码质量
```bash
npm run lint         # 使用 Biome 进行代码检查
npm run format       # 使用 Biome 格式化代码
npm run check        # 运行 Biome 的完整检查
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
- `src/server.ts` 是 Hono 应用入口，配置中间件和路由
- `src/routes/api/$.ts` 是 catch-all 路由，将 `/api/*` 请求转发给 Hono
- API 路由模块放在 `src/routes-api/` 目录（如 `todos.ts`）
- 内置中间件：logger、cors
- 添加新 API：在 `src/routes-api/` 创建路由文件，然后在 `src/server.ts` 中挂载

### 样式
- 使用 **Tailwind CSS v4**（通过 Vite 插件）
- 全局样式在 `src/styles.css`

### 部署
- 配置为部署到 **Cloudflare Workers**
- `wrangler.jsonc` 包含 Cloudflare 部署配置
- 使用 `@cloudflare/vite-plugin` 进行 SSR 环境配置
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
- `vite.config.ts` - Vite 和插件配置
- `wrangler.jsonc` - Cloudflare Workers 部署配置
