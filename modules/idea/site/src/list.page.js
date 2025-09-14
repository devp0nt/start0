import { jsx as _jsx } from "react/jsx-runtime";
import { GeneralLayout } from "@site/core/components/GeneralLayout";
import { Page0 } from "@site/core/lib/page0";
import { siteRoutes } from "@site/core/lib/routes";
import { trpc } from "@site/core/lib/trpc";
import { IdeasPage } from "./list.page.comp";
export default Page0.route(siteRoutes.ideasList)
    .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions());
})
    .title(`Ideas`)
    .layout(GeneralLayout)
    .component(({ loaderData: { ideas } }) => {
    return _jsx(IdeasPage, { ideas: ideas });
});
