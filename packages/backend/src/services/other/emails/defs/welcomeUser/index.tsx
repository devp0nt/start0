import { createEmailDefinition } from '@/backend/src/services/other/emails/index.js'
import { userSignInRoute } from '@/webapp/src/lib/routes.js'
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

export const welcomeUserEmail = createEmailDefinition<{
  email: string
  password: string
}>({
  name: 'welcomeUser',
  subject: 'Welcome to Svagatron!',
  template: ({ email, password }) => (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>Instuctions for new user</MjmlTitle>
        <MjmlPreview>Instuctions for new user</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection>
          <MjmlColumn>
            <MjmlText>
              Welcome to Svagatron as an user!
              <br />
              <br />
              E-mail: {email}
              <br />
              Password: {password}
              <br />
              Sing In Url: <a href={userSignInRoute.get({ abs: true })}>{userSignInRoute.get({ abs: true })}</a>
            </MjmlText>
            <MjmlButton padding="20px" backgroundColor="#346DB7" href={userSignInRoute.get({ abs: true })}>
              Sign In
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  ),
  previewVariables: { email: 'test@example.com', password: 'ABC123!!' },
})
