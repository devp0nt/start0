import { appName } from '@apps/shared/utils'
import { AuthPage } from '@refinedev/antd'

export const ForgotPasswordPage = () => {
  return <AuthPage type="forgotPassword" title={appName} />
}
