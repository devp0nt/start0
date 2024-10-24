import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'

export const TermsPage = withPageWrapper({
  title: 'Terms',
  Layout: GeneralLayout,
})(() => {
  return (
    <div>
      <h1>Terms</h1>
    </div>
  )
})
