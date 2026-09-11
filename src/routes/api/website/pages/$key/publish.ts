import { createFileRoute } from '@tanstack/react-router'
import { getCurrentUser } from '@/lib/auth'
import { publishPage } from '@/lib/website-content'

export const Route = createFileRoute('/api/website/pages/$key/publish')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        try {
          const user = await getCurrentUser(request)
          if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
          
          const { key } = params
          const body = await request.json()
          const { actor } = body
          
          const actorData = actor || { id: user.id, name: user.name, role: user.role }
          
          const page = await publishPage(
            key as "homepage" | "about" | "contact" | "other",
            actorData
          )
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed to publish page:', error)
          return Response.json({ error: 'Failed to publish page' }, { status: 500 })
        }
      },
    },
  },
})