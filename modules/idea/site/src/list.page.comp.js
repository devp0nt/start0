import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SiteCtx } from "@site/core/lib/ctx";
import { siteRoutes } from "@site/core/lib/routes";
import { Link } from "react-router";
export const IdeasPage = ({ ideas }) => {
    const ctx = SiteCtx.useCtx();
    return (_jsxs("div", { children: [_jsx("h1", { children: "Ideas" }), _jsxs("ul", { children: [ideas.map((idea) => (_jsx("li", { children: _jsx(Link, { to: siteRoutes.ideaView.get({ sn: idea.sn }), children: idea.title }) }, idea.id))), _jsx("li", { children: _jsx(Link, { to: `/ideas/234234`, children: "Non-existing idea" }) })] }), _jsx("pre", { children: JSON.stringify(ctx, null, 2) })] }));
};
