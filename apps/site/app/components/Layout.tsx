import { NavLink, Outlet, useNavigation } from "react-router";

const layoutStyles = {
  display: "flex",
  minHeight: "100vh",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const sidebarStyles = {
  width: "250px",
  backgroundColor: "#1a1a1a",
  color: "white",
  padding: "20px",
  boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
};

const mainContentStyles = {
  flex: 1,
  padding: "20px",
  backgroundColor: "#f5f5f5",
};

const navStyles = {
  marginTop: "40px",
};

const navLinkStyles = {
  display: "block",
  padding: "12px 16px",
  marginBottom: "8px",
  color: "#e0e0e0",
  textDecoration: "none",
  borderRadius: "6px",
  transition: "all 0.2s ease",
  cursor: "pointer",
};

const activeNavLinkStyles = {
  ...navLinkStyles,
  backgroundColor: "#3b82f6",
  color: "white",
};

const pendingNavLinkStyles = {
  ...navLinkStyles,
  color: "red",
};

const transitionNavLinkStyles = {
  ...navLinkStyles,
  color: "blue",
};

const logoStyles = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
  color: "#3b82f6",
};

export default function Layout() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <div style={layoutStyles}>
      <aside style={sidebarStyles}>
        <div style={logoStyles}>IdeaNick</div>
        <nav style={navStyles}>
          <NavLink
            to="/"
            style={({ isActive, isPending, isTransitioning }) => {
              return isActive
                ? activeNavLinkStyles
                : isPending
                  ? pendingNavLinkStyles
                  : isTransitioning
                    ? transitionNavLinkStyles
                    : navLinkStyles;
            }}
          >
            🏠 Home
          </NavLink>
          <NavLink
            to="/ideas"
            end
            style={({ isActive, isPending, isTransitioning }) => {
              return isActive
                ? activeNavLinkStyles
                : isPending
                  ? pendingNavLinkStyles
                  : isTransitioning
                    ? transitionNavLinkStyles
                    : navLinkStyles;
            }}
          >
            📰 Ideas
          </NavLink>
        </nav>
      </aside>
      <main style={{ ...mainContentStyles, opacity: isNavigating ? 0.5 : 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
