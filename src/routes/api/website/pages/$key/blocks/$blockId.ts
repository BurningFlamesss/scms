import { createFileRoute } from '@tanstack/react-router'
import { getCurrentUser } from '@/lib/auth'
import {
  updateBlockFields,
  toggleBlockVisibility,
  moveBlock,
  deleteBlock,
} from '@/lib/website-content'
import type { WebsitePageKey } from '@/types'

export const Route = createFileRoute('/api/website/pages/$key/blocks/$blockId')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const user = await getCurrentUser(request)
          if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
          
          const { key, blockId } = params
          const body = await request.json()
          const { fields, actor, direction, visibility } = body
          
          const actorData = actor || { id: user.id, name: user.name, role: user.role }
          
          let page
          if (direction) {
            page = await moveBlock(
              key as WebsitePageKey,
              blockId,
              direction,
              actorData
            )
          } else if (visibility !== undefined) {
            page = await toggleBlockVisibility(
              key as WebsitePageKey,
              blockId,
              actorData
            )
          } else if (fields) {
            page = await updateBlockFields(
              key as WebsitePageKey,
              blockId,
              fields,
              actorData
            )
          } else {
            return Response.json({ error: 'Invalid request' }, { status: 400 })
          }
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed to update block:', error)
          return Response.json({ error: 'Failed to update block' }, { status: 500 })
        }
      },
      DELETE: async ({ params, request }) => {
        try {
          const user = await getCurrentUser(request)
          if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
          
          const { key, blockId } = params
          const body = await request.json()
          const { actor } = body
          
          const actorData = actor || { id: user.id, name: user.name, role: user.role }
          
          const page = await deleteBlock(
            key as WebsitePageKey,
            blockId,
            actorData
          )
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed to delete block:', error)
          return Response.json({ error: 'Failed to delete block' }, { status: 500 })
        }
      },
    },
  },
})