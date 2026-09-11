import { createFileRoute } from '@tanstack/react-router'
import { getPublishedPage, listWebsitePages, ensureDefaultPages } from '@/lib/website-content'

export const Route = createFileRoute('/api/website/pages')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await ensureDefaultPages()
          const pages = await listWebsitePages()
          return Response.json({ pages })
        } catch (error) {
          console.error('Failed to fetch website pages:', error)
          return Response.json({ error: 'Failed to fetch pages' }, { status: 500 })
        }
      },
    },
  },
})