import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'

export const UserRestorePasswordPage = withPageWrapper({
  title: 'Restore Password',
  Layout: GeneralLayout,
})(() => {
  return (
    <div>
      <h1>RestorePasswordPage</h1>
    </div>
  )
})
