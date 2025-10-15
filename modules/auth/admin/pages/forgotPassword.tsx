import { projectName } from '@shared/base/general'
import { AuthPage } from '@refinedev/antd'

export const ForgotPasswordPage = () => {
  return <AuthPage type="forgotPassword" title={projectName} />
}
