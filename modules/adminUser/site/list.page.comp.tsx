// import { SiteCtx } from '@site/core/lib/ctx'
// import { siteRoutes } from '@site/core/lib/routes'
// import { Link } from 'react-router'

// export const AdminUsersPage: React.FC<{
//   adminUsers: Array<{
//     id: string
//     sn: string
//     title: string
//   }>
// }> = ({ adminUsers }) => {
//   const ctx = SiteCtx.useCtx()
//   return (
//     <div>
//       <h1>AdminUsers</h1>
//       <ul>
//         {adminUsers.map((adminUser) => (
//           <li key={adminUser.id}>
//             <Link to={siteRoutes.adminUserView.get({ sn: adminUser.sn })}>{adminUser.title}</Link>
//           </li>
//         ))}
//         <li>
//           <Link to={`/adminUsers/234234`}>Non-existing adminUser</Link>
//         </li>
//       </ul>
//       <pre>{JSON.stringify(ctx, null, 2)}</pre>
//     </div>
//   )
// }
