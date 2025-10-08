// import { GeneralLayout } from '@site/core/components/GeneralLayout'
// import { Page0 } from '@site/core/lib/page0'
// import { siteRoutes } from '@site/core/lib/routes'
// import { trpc } from '@site/core/lib/trpc'

// const page = Page0.route(siteRoutes.adminUserView)
//   .loader(async ({ qc, params }) => {
//     return await qc.fetchQuery(trpc.getAdminUser.queryOptions({ adminUserSn: params.sn }))
//   })
//   .title(({ params, loaderData: { adminUser } }) => `AdminUser: ${adminUser.title}`)
//   .layout(GeneralLayout)
//   .component(({ params, query, loaderData: { adminUser }, ctx }) => {
//     return (
//       <div>
//         <h1>{adminUser.title}2ssssss2</h1>
//         <p>{adminUser.description}</p>
//         <pre>params:{JSON.stringify(params, null, 2)}</pre>
//         <pre>query:{JSON.stringify(query, null, 2)}</pre>
//         <pre>ctx:{JSON.stringify(ctx, null, 2)}</pre>
//       </div>
//     )
//   })

// export default page
