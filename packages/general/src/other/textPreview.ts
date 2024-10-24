type WithSnOrNull = { sn: number } | null
export const getTextPreview = (
  {
    user,
    admin,
    project,
  }: {
    user?: WithSnOrNull
    project?: WithSnOrNull
    admin?: WithSnOrNull
  },
  withPlaceholder?: boolean
) => {
  if (user) {
    return `User #${user.sn}`
  }
  if (admin) {
    return `Admin #${admin.sn}`
  }
  if (project) {
    return `Project #${project.sn}`
  }
  return withPlaceholder ? '?' : null
}
