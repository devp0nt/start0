import { SignInPageComponent } from '@/general/src/auth/components/SignInPageComponent/index.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'

export const AdminSignInPage = withPageWrapper({
  title: 'Sign In As Admin',
  Layout: GeneralLayout,
})(() => {
  return <SignInPageComponent viewerRole="admin" />
})
