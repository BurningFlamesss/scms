import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/packages/auth/auth.ts'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        console.log('Auth GET:', request.url, params);
        console.log('Auth handler type:', typeof auth.handler);
        const clonedRequest = request.clone();
        const body = await clonedRequest.text();
        console.log('Request body:', body);
        const response = await auth.handler(request);
        console.log('Auth GET response:', response.status);
        return response;
      },
      POST: async ({ request, params }) => {
        console.log('Auth POST:', request.url, params);
        console.log('Auth handler type:', typeof auth.handler);
        const clonedRequest = request.clone();
        const body = await clonedRequest.text();
        console.log('Request body:', body);
        const response = await auth.handler(request);
        console.log('Auth POST response:', response.status);
        return response;
      },
    },
  },
})
