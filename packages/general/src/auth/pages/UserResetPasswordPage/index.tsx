import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'

export const UserResetPasswordPage = withPageWrapper({
  title: 'Reset Password',
  Layout: GeneralLayout,
})(() => {
  return (
    <div>
      <h1>ResetPasswordPage</h1>
    </div>
  )
})
