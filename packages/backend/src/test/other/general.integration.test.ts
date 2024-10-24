import { u } from '@/backend/src/test/helpers/integration.js'

describe('general', () => {
  it('auth admin', async () => {
    const { admin, ta } = await u.a.adminAuth()
    const r1 = await ta.getMe()
    expect(r1.me.admin).toBeTruthy()
    expect(r1.me.admin?.id).toBe(admin.id)
    // expect(r1.me.admin?.createdAt.toISOString()).toBe(u.getDate().toISOString())
  })

  it('auth user', async () => {
    const { admin } = await u.a.adminAuth()
    const { user, tu } = await u.a.userAuth({ admin, index: 0 })
    const r1 = await tu.getMe()
    expect(r1.me.user).toBeTruthy()
    expect(r1.me.user?.id).toBe(user.id)
    // expect(r1.me.user?.createdAt.toISOString()).toBe(u.getDate().toISOString())
  })

  it('new project', async () => {
    const { admin } = await u.a.adminAuth()
    const { user } = await u.a.userAuth({ admin, index: 0 })
    const r1 = await u.a.newProject({ user, index: 0 })
    expect(r1.project.id).toBeTruthy()
  })
})
