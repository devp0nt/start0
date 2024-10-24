import { zSignInAdminEndpointInput } from '@/general/src/auth/routes/signInAdmin/input.js'
import { zSignInUserEndpointInput } from '@/general/src/auth/routes/signInUser/input.js'
import { Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { adminDashboardRoute, userDashboardRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useNavigate } from 'react-router-dom'

export const SignInPageComponent = ({ viewerRole }: { viewerRole: 'admin' | 'user' }) => {
  const { signInTrpc, zSignInEndpointInput, dashboardRoute, title } = {
    admin: {
      signInTrpc: trpc.signInAdmin,
      zSignInEndpointInput: zSignInAdminEndpointInput,
      dashboardRoute: adminDashboardRoute,
      title: 'Sign In As Admin',
    },
    user: {
      signInTrpc: trpc.signInUser,
      zSignInEndpointInput: zSignInUserEndpointInput,
      dashboardRoute: userDashboardRoute,
      title: 'Sign In',
    },
  }[viewerRole]
  const navigate = useNavigate()
  const signIn = signInTrpc.useMutation()
  const trpcUtils = trpc.useUtils()
  const formy = useFormy({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: zSignInEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      await signIn.mutateAsync(valuesInput)
      await trpcUtils.invalidate()
      navigate(dashboardRoute.get())
    },
  })
  return (
    <Block fcnw>
      <Segment title={title} size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="E-mail" {...formy.getFieldProps('email')} />
          <Textfieldy label="Password" type="password" {...formy.getFieldProps('password')} />
          <Buttons>
            <Button {...formy.buttonProps} type="submit">
              Sign In
            </Button>
          </Buttons>
        </FormItems>
      </Segment>
    </Block>
  )
}
