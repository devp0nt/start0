import { zCreateProjectForUserEndpointInput } from '@/general/src/project/routes/createProjectForUser/input.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { userProjectViewRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useNavigate } from 'react-router-dom'

export const UserProjectNewPage = withPageWrapper({
  title: 'New Project',
  Layout: GeneralLayout,
  authorizedUsersOnly: true,
})(() => {
  const navigate = useNavigate()
  const createProjectForUser = trpc.createProjectForUser.useMutation()
  const formy = useFormy({
    initialValues: {
      name: '',
    },
    validationSchema: zCreateProjectForUserEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      const res = await createProjectForUser.mutateAsync({
        ...valuesInput,
      })
      navigate(userProjectViewRoute.get({ projectSn: res.project.sn }))
    },
    successMessage: 'Project created',
  })
  return (
    <Block fcnw>
      <Segment title="New Project" size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="Name" {...formy.getFieldProps('name')} />
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
