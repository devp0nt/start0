import { canManageUsers, userPermissionsOptions } from '@/general/src/auth/can.js'
import { zUpdateUserForAdminEndpointInput } from '@/general/src/user/routes/updateUserForAdmin/input.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Checkboxesy, Switchy, Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminUserEditRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useRouteParams } from '@/webapp/src/lib/useRoute.js'

export const AdminUserEditPage = withPageWrapper({
  title: 'Edit User',
  Layout: GeneralLayout,
  authorizedAdminsOnly: true,
  useQuery: () => {
    const { routeParams } = useRouteParams(adminUserEditRoute)
    return trpc.getUserForAdmin.useQuery({
      userSn: +routeParams.userSn,
    })
  },
  checkAccess: ({ ctx }) => canManageUsers(ctx.me.admin),
  setProps: ({ queryResult }) => ({
    user: queryResult.data.user,
  }),
})(({ user }) => {
  const updateUserForAdmin = trpc.updateUserForAdmin.useMutation()
  const trpcUtils = trpc.useUtils()
  const formy = useFormy({
    initialValues: {
      userId: user.id,
      name: user.name || '',
      email: user.email,
      permissions: user.permissions,
      banned: !!user.bannedAt,
    },
    validationSchema: zUpdateUserForAdminEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      const res = await updateUserForAdmin.mutateAsync({
        ...valuesInput,
      })
      trpcUtils.getUserForAdmin.setData({ userSn: res.user.sn }, res)
    },
    successMessage: 'User updated',
  })
  return (
    <Block fcnw>
      <Segment title={`User #${user.sn}`} size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="Name" {...formy.getFieldProps('name')} />
          <Textfieldy label="E-mail" {...formy.getFieldProps('email')} />
          <Checkboxesy label="Permissions" options={userPermissionsOptions} {...formy.getFieldProps('permissions')} />
          <Switchy {...formy.getFieldProps('banned')} label="Banned" optionLabel="Yes" />
          <Buttons>
            <Button {...formy.buttonProps} type="submit">
              Save
            </Button>
          </Buttons>
        </FormItems>
      </Segment>
    </Block>
  )
})
