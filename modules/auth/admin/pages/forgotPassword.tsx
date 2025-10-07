import { appName } from '@apps/shared/general'
import { AuthPage } from '@refinedev/antd'

export const ForgotPasswordPage = () => {
  return <AuthPage type="forgotPassword" title={appName} />
}
