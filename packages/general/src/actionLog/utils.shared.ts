export const actionLogActions = {
  createProjectForUser: 'User created a project',
  updateProjectForUser: 'User updated a project',
  updateMyPasswordForAdmin: 'Admin updated his password',
  updateMyPasswordForUser: 'User updated his password',
  createAdminForAdmin: 'Admin created another admin',
  updateAdminForAdmin: 'Admin updated another admin',
  createUserForAdmin: 'Admin created a user',
  updateUserForAdmin: 'Admin updated a user',
}
export type ActionLogAction = keyof typeof actionLogActions
export const toHumanActionLogAction = (action: string): string => {
  return (actionLogActions as any)[action] || action
}
