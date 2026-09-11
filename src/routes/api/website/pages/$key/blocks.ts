import { createFileRoute } from '@tanstack/react-router'
import { getCurrentUser } from '@/lib/auth'
import { addBlock, reorderBlocks, duplicateBlock } from '@/lib/website-content'

export const Route = createFileRoute('/api/website/pages/$key/blocks')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        try {
          const user = await getCurrentUser(request)
          if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
          
          const { key } = params
          const body = await request.json()
          const { type, actor, orderedIds, blockId } = body
          
          const actorData = actor || { id: user.id, name: user.name, role: user.role }
          
          let page
          if (type) {
            page = await addBlock(
              key as "homepage" | "about" | "contact" | "other",
              type,
              actorData
            )
          } else if (orderedIds) {
            page = await reorderBlocks(
              key as "homepage" | "about" | "contact" | "other",
              orderedIds,
              actorData
            )
          } else if (blockId) {
            page = await duplicateBlock(
              key as "homepage" | "about" | "contact" | "other",
              blockId,
              actorData
            )
          } else {
            return Response.json({ error: 'Invalid request' }, { status: 400 })
          }
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed block operation:', error)
          return Response.json({ error: 'Failed block operation' }, { status: 500 })
        }
      },
    },
  },
})