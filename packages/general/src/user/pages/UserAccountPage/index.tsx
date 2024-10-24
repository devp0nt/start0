import { zPasswordsMustBeTheSame, zStringRequired } from '@/general/src/other/validation.js'
import { zUpdateMyPasswordForUserEndpointInput } from '@/general/src/user/routes/updateMyPasswordForUser/input.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment, Segments } from '@/webapp/src/lib/uninty.components.js'

const Password = () => {
  const updatePassword = trpc.updateMyPasswordForUser.useMutation()
  const formy = useFormy({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      newPasswordAgain: '',
    },
    validationSchema: zUpdateMyPasswordForUserEndpointInput
      .extend({
        newPasswordAgain: zStringRequired,
      })
      .superRefine(zPasswordsMustBeTheSame('newPassword', 'newPasswordAgain')),
    onSubmit: async ({ valuesInput: { newPassword, oldPassword } }) => {
      await updatePassword.mutateAsync({ newPassword, oldPassword })
    },
    successMessage: 'Password successfully changed',
    resetOnSuccess: true,
  })
  return (
    <FormItems as="form" {...formy.formProps}>
      <Textfieldy label="Old Password" type="password" {...formy.getFieldProps('oldPassword')} />
      <Textfieldy label="New Password" type="password" {...formy.getFieldProps('newPassword')} />
      <Textfieldy label="New Password Again" type="password" {...formy.getFieldProps('newPasswordAgain')} />
      <Buttons>
        <Button {...formy.buttonProps} type="submit">
          Change Password
        </Button>
      </Buttons>
    </FormItems>
  )
}

export const UserAccountPage = withPageWrapper({
  title: 'My Account',
  Layout: GeneralLayout,
  authorizedUsersOnly: true,
  setProps: ({ getAuthorizedUserMe }) => ({
    me: getAuthorizedUserMe(),
  }),
})(({ me }) => {
  return (
    <Block fcnw>
      <Segment title="My Account" size="m">
        <Segments>
          <Segment title="Manage Password" size="s">
            <Password />
          </Segment>
        </Segments>
      </Segment>
    </Block>
  )
})
