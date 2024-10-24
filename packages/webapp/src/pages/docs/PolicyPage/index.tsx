import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'

export const PolicyPage = withPageWrapper({
  title: 'Poliy',
  Layout: GeneralLayout,
})(() => {
  return (
    <div>
      <h1>Poliy</h1>
    </div>
  )
})
