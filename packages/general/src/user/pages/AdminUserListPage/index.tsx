import { canViewUsers } from '@/general/src/auth/can.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminUserEditRoute, adminUserNewRoute } from '@/webapp/src/lib/routes.js'
import { SectionWrapper } from '@/webapp/src/lib/sectionWrapper.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, Segment, Table } from '@/webapp/src/lib/uninty.components.js'

export const AdminUserListPage = withPageWrapper({
  title: 'Users',
  Layout: GeneralLayout,
  authorizedAdminsOnly: true,
  checkAccess: ({ ctx }) => canViewUsers(ctx.me.admin),
})(() => {
  return (
    <Block fcnw>
      <Segment
        title="Users"
        size="m"
        desc={
          <Buttons>
            <Button as="a" href={adminUserNewRoute.get()}>
              New User
            </Button>
          </Buttons>
        }
      >
        <SectionWrapper
          useQuery={() => trpc.getUsersForAdmin.useQuery({})}
          setProps={({ queryResult }) => ({
            users: queryResult.data.users,
          })}
        >
          {({ users }) => {
            return (
              <Table
                records={users}
                href={(record) => adminUserEditRoute.get({ userSn: record.sn })}
                columns={[
                  { heading: 'SN', body: (record) => record.sn, width: 70 },
                  { heading: 'Name', body: (record) => record.name, width: 200 },
                  { heading: 'E-mail', body: (record) => record.email, width: 200 },
                ]}
              />
            )
          }}
        </SectionWrapper>
      </Segment>
    </Block>
  )
})
