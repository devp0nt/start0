import { ActionLogs } from '@/general/src/actionLog/components/ActionLogs/index.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { Block, Segment } from '@/webapp/src/lib/uninty.components.js'

export const AdminActionLogListPage = withPageWrapper({
  title: 'Action Logs',
  Layout: GeneralLayout,
  authorizedAdminsOnly: true,
})(() => {
  return (
    <Block fcnw g={60}>
      <Segment title="Action Logs" size="m">
        <ActionLogs />
      </Segment>
    </Block>
  )
})
