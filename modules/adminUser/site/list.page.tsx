// import { GeneralLayout } from '@site/core/components/GeneralLayout'
// import { Page0 } from '@site/core/lib/page0'
// import { siteRoutes } from '@site/core/lib/routes'
// import { trpc } from '@site/core/lib/trpc'
// import { AdminUsersPage } from './list.page.comp'

// const page = Page0.route(siteRoutes.adminUsersList)
//   .loader(async ({ qc }) => {
//     return await qc.fetchQuery(trpc.getAdminUsers.queryOptions())
//   })
//   .title(`AdminUsers`)
//   .layout(GeneralLayout)
//   .component(({ loaderData: { adminUsers } }) => {
//     return <AdminUsersPage adminUsers={adminUsers} />
//   })

// export default page
