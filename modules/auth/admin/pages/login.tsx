import { env } from '@admin/base/lib/env.runtime'
import { appName } from '@apps/base/general'
import { AuthPage } from '@refinedev/antd'

export const LoginPage = () => {
  return (
    <AuthPage
      title={appName}
      type="login"
      formProps={{
        initialValues: env.isLocalHostEnv
          ? { email: 'w@w.we', password: '1234', remember: true }
          : {
              email: '',
              password: '',
              remember: true,
            },
      }}
      registerLink={false}
    />
  )
}
