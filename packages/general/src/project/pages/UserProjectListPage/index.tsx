import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { userProjectNewRoute, userProjectViewRoute } from '@/webapp/src/lib/routes.js'
import { SectionWrapper } from '@/webapp/src/lib/sectionWrapper.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, Segment, Table } from '@/webapp/src/lib/uninty.components.js'

export const UserProjectListPage = withPageWrapper({
  title: 'Projects',
  Layout: GeneralLayout,
  authorizedUsersOnly: true,
})(() => {
  return (
    <Block fcnw>
      <Segment
        title="Projects"
        size="m"
        desc={
          <Buttons>
            <Button as="a" href={userProjectNewRoute.get()}>
              New Project
            </Button>
          </Buttons>
        }
      >
        <SectionWrapper
          useQuery={() => trpc.getProjectsForUser.useQuery({})}
          setProps={({ queryResult }) => ({
            projects: queryResult.data.projects,
          })}
        >
          {({ projects }) => {
            return (
              <Table
                records={projects}
                href={(record) => userProjectViewRoute.get({ projectSn: record.sn })}
                columns={[
                  { heading: 'SN', body: (record) => record.sn, width: 70 },
                  { heading: 'Name', body: (record) => record.name, width: 400 },
                ]}
              />
            )
          }}
        </SectionWrapper>
      </Segment>
    </Block>
  )
})
