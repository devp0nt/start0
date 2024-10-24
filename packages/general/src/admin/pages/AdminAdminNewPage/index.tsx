import { zCreateAdminForAdminEndpointInput } from '@/general/src/admin/routes/createAdminForAdmin/input.js'
import { adminPermissionsOptions, canManageAdmins } from '@/general/src/auth/can.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Checkboxesy, Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminAdminEditRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useNavigate } from 'react-router-dom'

export const AdminAdminNewPage = withPageWrapper({
  title: 'New Admin',
  Layout: GeneralLayout,
  authorizedAdminsOnly: true,
  checkAccess: ({ ctx }) => canManageAdmins(ctx.me.admin),
})(() => {
  const navigate = useNavigate()
  const createAdminForAdmin = trpc.createAdminForAdmin.useMutation()
  const formy = useFormy({
    initialValues: {
      name: '',
      email: '',
      permissions: [],
    },
    validationSchema: zCreateAdminForAdminEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      const res = await createAdminForAdmin.mutateAsync({
        ...valuesInput,
      })
      navigate(adminAdminEditRoute.get({ adminSn: res.admin.sn }))
    },
    successMessage: 'Admin created',
  })
  return (
    <Block fcnw>
      <Segment title="New Admin" size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="Name" {...formy.getFieldProps('name')} />
          <Textfieldy label="E-mail" {...formy.getFieldProps('email')} />
          <Checkboxesy label="Permissions" options={adminPermissionsOptions} {...formy.getFieldProps('permissions')} />
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
