import { createFileRoute } from '@tanstack/react-router'
import { useSchoolConfig } from '#/store/school-store.ts';

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const config = useSchoolConfig()
  return (
    <div>
      {config?.organization.name}
    </div>
  )
}
