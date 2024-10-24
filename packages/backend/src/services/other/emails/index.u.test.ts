import { welcomeUserEmail } from './defs/welcomeUser/index.js'

describe('Emails', () => {
  it('should send email', async () => {
    await welcomeUserEmail.send({
      to: 'x@example.com',
      variables: { email: 'x@example.com', password: '1234' },
    })
    expect(welcomeUserEmail.getLastSentEmail()?.name).toBe('welcomeUser')
    expect(welcomeUserEmail.getLastSentEmail()?.variables.email).toBe('x@example.com')
    expect(welcomeUserEmail.getLastSentEmail()?.variables.password).toBe('1234')
  })
})
