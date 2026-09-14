import { createFileRoute } from '@tanstack/react-router'
import { getWebsitePage, updatePageSeo } from '@/lib/website-content'
import { getCurrentUser } from '@/lib/auth'
import type { WebsitePageKey } from '@/types'

export const Route = createFileRoute('/api/website/pages/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { key } = params
          const page = await getWebsitePage(key as WebsitePageKey)
          
          if (!page) {
            return Response.json({ error: 'Page not found' }, { status: 404 })
          }
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed to fetch website page:', error)
          return Response.json({ error: 'Failed to fetch page' }, { status: 500 })
        }
      },
      PATCH: async ({ params, request }) => {
        try {
          const user = await getCurrentUser(request)
          if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
          
          const { key } = params
          const body = await request.json()
          const { seo, actor } = body
          
          const page = await updatePageSeo(
            key as WebsitePageKey,
            seo,
            actor || { id: user.id, name: user.name, role: user.role }
          )
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed to update page SEO:', error)
          return Response.json({ error: 'Failed to update SEO' }, { status: 500 })
        }
      },
    },
  },
})