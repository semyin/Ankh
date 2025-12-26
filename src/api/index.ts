export { createApiRouter }

import { getCookie } from 'hono/cookie'
import { logger } from '@/api/middleware/logger'
import { initSupabase } from '@/api/supabase'
import { createApp } from '@/api/utils'
import { result } from '@/api/utils/response'
import { articleRoute } from './article/article.route'
import { authRoute } from './auth/auth.route'
import { cacheRoute } from './cache/cache.route'
import { categoryRoute } from './category/category.route'
import { friendLinkRoute } from './friend-link/friend-link.route'
import { healthRouter } from './health/health.route'
import { metaRoute } from './meta/meta.route'
import { profileRoute } from './profile/profile.route'
import { tagRoute } from './tag/tag.route'
import { uploadRoute } from './upload/upload.route'

function createApiRouter() {

  console.log(import.meta.env.SUPABASE_URL);
  

  const app = createApp()

  // Apply logger for API routes
  app.use('*', logger)

  app.use('*', async (c, next) => {
    const accessToken = getCookie(c, 'access_token')
    const Authorization = accessToken ? `Bearer ${accessToken}` : ''
    const supabase = initSupabase({
      global: {
        headers: {
          Authorization,
        },
      },
    })  
    c.set('supabase', supabase)
    await next()
  })

  // Mount route handlers
  app.route('/auth', authRoute)
  app.route('/articles', articleRoute)
  app.route('/categories', categoryRoute)
  app.route('/tags', tagRoute)
  app.route('/meta', metaRoute)
  app.route('/friend-links', friendLinkRoute)
  app.route('/profile', profileRoute)
  app.route('/upload', uploadRoute)
  app.route('/cache', cacheRoute)
  app.route('/health', healthRouter)

  // 404 handler for API routes - must be last
  app.all('*', (c) => {
    return result.error(c, `API endpoint not found: ${c.req.method} ${c.req.path}`, 404)
  })

  app.onError((err, c) => {
    console.error('API Error:', err)
    return result.error(c, err.message || 'Internal Server Error', 500)
  })

  return app
}

const app = createApp()

const api = createApiRouter()

app.route('/api', api)

export { app }
