import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminSignInRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const AdminSignOutPage = withPageWrapper({
  title: 'Logout',
  Layout: GeneralLayout,
})(() => {
  const navigate = useNavigate()
  const trpcUtils = trpc.useUtils()
  const signOut = trpc.signOut.useMutation()
  useEffect(() => {
    void (async () => {
      await signOut.mutateAsync({ role: 'admin' })
      await trpcUtils.invalidate()
      navigate(adminSignInRoute.get(), { replace: true })
    })()
  }, [])
  return <div>Loading...</div>
})
