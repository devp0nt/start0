import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { GeneralLayout } from "@site/core/components/GeneralLayout";
import { Page0 } from "@site/core/lib/page0";
import { siteRoutes } from "@site/core/lib/routes";
import { trpc } from "@site/core/lib/trpc";
export default Page0.route(siteRoutes.ideaView)
    .loader(async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }));
})
    .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
    .layout(GeneralLayout)
    .component(({ params, query, loaderData: { idea }, ctx }) => {
    return (_jsxs("div", { children: [_jsxs("h1", { children: [idea.title, "2ssssss2"] }), _jsx("p", { children: idea.description }), _jsxs("pre", { children: ["params:", JSON.stringify(params, null, 2)] }), _jsxs("pre", { children: ["query:", JSON.stringify(query, null, 2)] }), _jsxs("pre", { children: ["ctx:", JSON.stringify(ctx, null, 2)] })] }));
});
