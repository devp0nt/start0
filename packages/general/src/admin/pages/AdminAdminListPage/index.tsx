import { canManageAdmins } from '@/general/src/auth/can.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { adminAdminEditRoute, adminAdminNewRoute } from '@/webapp/src/lib/routes.js'
import { SectionWrapper } from '@/webapp/src/lib/sectionWrapper.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Block, Button, Buttons, Segment, Table } from '@/webapp/src/lib/uninty.components.js'

export const AdminAdminListPage = withPageWrapper({
  title: 'Admins',
  Layout: GeneralLayout,
  checkAccess: ({ ctx }) => canManageAdmins(ctx.me.admin),
  setProps: ({ getAuthorizedAdminMe }) => ({ me: getAuthorizedAdminMe() }),
})(({ me }) => {
  return (
    <Block fcnw>
      <Segment
        title="Admins"
        size="m"
        desc={
          canManageAdmins(me.admin) && (
            <Buttons>
              <Button as="a" href={adminAdminNewRoute.get()}>
                New Admin
              </Button>
            </Buttons>
          )
        }
      >
        <SectionWrapper
          useQuery={() => trpc.getAdminsForAdmin.useQuery({})}
          setProps={({ queryResult }) => ({
            admins: queryResult.data.admins,
          })}
        >
          {({ admins }) => {
            return (
              <Table
                records={admins}
                href={(record) => adminAdminEditRoute.get({ adminSn: record.sn })}
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
