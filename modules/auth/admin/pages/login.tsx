import { env } from '@admin/base/lib/env.runtime'
import { projectName } from '@shared/base/general'
import { AuthPage } from '@refinedev/antd'

export const LoginPage = () => {
  return (
    <AuthPage
      title={projectName}
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
