import { createFileRoute } from '@tanstack/react-router'
import honoApp from '../../server'

// 创建 API 路由，捕获所有 /api/* 请求并转发给 Hono
export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return honoApp.fetch(request)
      },
      POST: async ({ request }) => {
        return honoApp.fetch(request)
      },
      PUT: async ({ request }) => {
        return honoApp.fetch(request)
      },
      DELETE: async ({ request }) => {
        return honoApp.fetch(request)
      },
      PATCH: async ({ request }) => {
        return honoApp.fetch(request)
      }
    }
  }
})
