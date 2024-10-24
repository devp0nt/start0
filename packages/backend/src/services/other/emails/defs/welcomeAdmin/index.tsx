import { createEmailDefinition } from '@/backend/src/services/other/emails/index.js'
import { adminSignInRoute } from '@/webapp/src/lib/routes.js'
import {
  Mjml,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlHead,
  MjmlPreview,
  MjmlSection,
  MjmlText,
  MjmlTitle,
} from '@faire/mjml-react'

export const welcomeAdminEmail = createEmailDefinition<{
  email: string
  password: string
}>({
  name: 'welcomeAdmin',
  subject: 'Welcome to Svagatron!',
  template: ({ email, password }) => (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>Instuctions for new admin</MjmlTitle>
        <MjmlPreview>Instuctions for new admin</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection>
          <MjmlColumn>
            <MjmlText>
              Welcome to Svagatron as an admin!
              <br />
              <br />
              E-mail: {email}
              <br />
              Password: {password}
              <br />
              Sing In Url: <a href={adminSignInRoute.get({ abs: true })}>{adminSignInRoute.get({ abs: true })}</a>
            </MjmlText>
            <MjmlButton padding="20px" backgroundColor="#346DB7" href={adminSignInRoute.get({ abs: true })}>
              Sign In
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  ),
  previewVariables: { email: 'test@example.com', password: 'ABC123!!' },
})
