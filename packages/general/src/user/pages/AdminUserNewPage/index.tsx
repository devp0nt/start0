import { canManageUsers, userPermissionsOptions } from '@/general/src/auth/can.js'
import { zCreateUserForAdminEndpointInput } from '@/general/src/user/routes/createUserForAdmin/input.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Checkboxesy, Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminUserEditRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useNavigate } from 'react-router-dom'

export const AdminUserNewPage = withPageWrapper({
  title: 'New User',
  Layout: GeneralLayout,
  authorizedAdminsOnly: true,
  checkAccess: ({ ctx }) => canManageUsers(ctx.me.admin),
})(() => {
  const navigate = useNavigate()
  const createUserForAdmin = trpc.createUserForAdmin.useMutation()
  const formy = useFormy({
    initialValues: {
      name: '',
      email: '',
      permissions: [],
    },
    validationSchema: zCreateUserForAdminEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      const res = await createUserForAdmin.mutateAsync({
        ...valuesInput,
      })
      navigate(adminUserEditRoute.get({ userSn: res.user.sn }))
    },
    successMessage: 'User created',
  })
  return (
    <Block fcnw>
      <Segment title="New User" size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="Name" {...formy.getFieldProps('name')} />
          <Textfieldy label="E-mail" {...formy.getFieldProps('email')} />
          <Checkboxesy label="Permissions" options={userPermissionsOptions} {...formy.getFieldProps('permissions')} />
          <Buttons>
            <Button {...formy.buttonProps} type="submit">
              Create
            </Button>
          </Buttons>
        </FormItems>
      </Segment>
    </Block>
  )
})
