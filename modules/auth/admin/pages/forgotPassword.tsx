import { appName } from '@apps/base/general'
import { AuthPage } from '@refinedev/antd'

export const ForgotPasswordPage = () => {
  return <AuthPage type="forgotPassword" title={appName} />
}
