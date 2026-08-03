import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

const tokens = {
  bg: "#12161C",
  bgHover: "#1B212A",
  bgActive: "#232B36",
  border: "#232B36",
  text: "#E8ECF1",
  textMuted: "#7C8896",
  accent: "#3ECF8E",
  mono: '"IBM Plex Mono", "JetBrains Mono", "SFMono-Regular", Menlo, monospace',
  sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
};

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  // { to: "/services", label: "Services", icon: Settings2 },
  // { to: "/database", label: "Database", icon: Database },
  // { to: "/projects", label: "Projects", icon: FolderKanban },
  // { to: "/settings", label: "Settings", icon: Settings },
];

const HEADER_HEIGHT = 64;

export default function Header() {
  return (
    <header
      style={{
        width: "100%",
        height: HEADER_HEIGHT,
        minHeight: HEADER_HEIGHT,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        background: tokens.bg,
        borderBottom: `1px solid ${tokens.border}`,
        boxSizing: "border-box",
        padding: "0 16px",
        gap: 24,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: tokens.sans,
          fontSize: 15,
          fontWeight: 700,
          color: tokens.text,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Dev Panel
      </h2>

      {/* Nav links */}
      <nav
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          overflowX: "auto",
        }}
      >
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              borderRadius: 8,
              textDecoration: "none",
              fontFamily: tokens.mono,
              fontSize: 13,
              letterSpacing: "0.02em",
              color: isActive ? tokens.accent : tokens.textMuted,
              background: isActive ? tokens.bgActive : "transparent",
              borderBottom: isActive
                ? `2px solid ${tokens.accent}`
                : "2px solid transparent",
              transition: "background 150ms ease, color 150ms ease",
              whiteSpace: "nowrap",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.background = tokens.bgHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                e.currentTarget.getAttribute("aria-current") === "page"
                  ? tokens.bgActive
                  : "transparent";
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
