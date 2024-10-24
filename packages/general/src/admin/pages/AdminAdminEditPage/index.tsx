import { zUpdateAdminForAdminEndpointInput } from '@/general/src/admin/routes/updateAdminForAdmin/input.js'
import { adminPermissionsOptions, canManageAdmins } from '@/general/src/auth/can.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Checkboxesy, Switchy, Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminAdminEditRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useRouteParams } from '@/webapp/src/lib/useRoute.js'

export const AdminAdminEditPage = withPageWrapper({
  title: 'Edit Admin',
  Layout: GeneralLayout,
  authorizedAdminsOnly: true,
  useQuery: () => {
    const { routeParams } = useRouteParams(adminAdminEditRoute)
    return trpc.getAdminForAdmin.useQuery({
      adminSn: +routeParams.adminSn,
    })
  },
  checkAccess: ({ ctx }) => canManageAdmins(ctx.me.admin),
  setProps: ({ queryResult }) => ({
    admin: queryResult.data.admin,
  }),
})(({ admin }) => {
  const updateAdminForAdmin = trpc.updateAdminForAdmin.useMutation()
  const trpcUtils = trpc.useUtils()
  const formy = useFormy({
    initialValues: {
      adminId: admin.id,
      name: admin.name || '',
      email: admin.email,
      permissions: admin.permissions,
      banned: !!admin.bannedAt,
    },
    validationSchema: zUpdateAdminForAdminEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      const res = await updateAdminForAdmin.mutateAsync({
        ...valuesInput,
      })
      trpcUtils.getAdminForAdmin.setData({ adminSn: res.admin.sn }, res)
    },
    successMessage: 'Admin updated',
  })
  return (
    <Block fcnw>
      <Segment title={`Admin #${admin.sn}`} size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="Name" {...formy.getFieldProps('name')} />
          <Textfieldy label="E-mail" {...formy.getFieldProps('email')} />
          <Checkboxesy label="Permissions" options={adminPermissionsOptions} {...formy.getFieldProps('permissions')} />
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
