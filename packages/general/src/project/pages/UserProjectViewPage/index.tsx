import { zUpdateProjectForUserEndpointInput } from '@/general/src/project/routes/updateProjectForUser/input.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { Textfieldy, useFormy } from '@/webapp/src/lib/formy.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { userProjectViewRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, FormItems, Segment } from '@/webapp/src/lib/uninty.components.js'
import { useRouteParams } from '@/webapp/src/lib/useRoute.js'

export const UserProjectViewPage = withPageWrapper({
  title: 'Edit Project',
  Layout: GeneralLayout,
  authorizedUsersOnly: true,
  useQuery: () => {
    const { routeParams } = useRouteParams(userProjectViewRoute)
    return trpc.getProjectForUser.useQuery({
      projectSn: +routeParams.projectSn,
    })
  },
  setProps: ({ queryResult }) => ({
    project: queryResult.data.project,
  }),
})(({ project }) => {
  const updateProjectForUser = trpc.updateProjectForUser.useMutation()
  const trpcUtils = trpc.useUtils()
  const formy = useFormy({
    initialValues: {
      projectId: project.id,
      name: project.name,
    },
    validationSchema: zUpdateProjectForUserEndpointInput,
    onSubmit: async ({ valuesInput }) => {
      const res = await updateProjectForUser.mutateAsync({
        ...valuesInput,
      })
      trpcUtils.getProjectForUser.setData({ projectSn: res.project.sn }, res)
    },
    successMessage: 'Project updated',
  })
  return (
    <Block fcnw>
      <Segment title={`Project #${project.sn}`} size="m">
        <FormItems as="form" {...formy.formProps}>
          <Textfieldy label="Name" {...formy.getFieldProps('name')} />
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
