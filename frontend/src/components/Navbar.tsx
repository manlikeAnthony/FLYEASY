import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

type NavItem = {
  to: string;
  label: string;
};

function Navbar() {
  const { user, clearAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const navItems = useMemo<NavItem[]>(() => {
    const base: NavItem[] = [
      { to: "/", label: "Home" },
      { to: "/book", label: "Book Flight" },
      { to: "/track-request", label: "Track Request" },
    ];
    if (user) base.push({ to: "/my", label: "My Requests" });
    if (isAdmin) {
      // Simplify admin navigation: use Dashboard as the single admin hub
      base.push({ to: "/admin", label: "Dashboard" });
    }
    return base;
  }, [isAdmin, user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    clearAuth();
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Desktop + Mobile Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm"
            style={{ backgroundColor: "var(--accent)" }}
          >
            FE
          </div>
          <div className="hidden md:block">
            <div
              className="text-sm font-bold"
              style={{ color: "var(--accent)" }}
            >
              FlyEasyNG
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Affordable · Reliable
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center gap-3 justify-center flex-nowrap min-w-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="px-2 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              style={({ isActive }: { isActive: boolean }) => ({
                color: isActive ? "var(--accent-2)" : "var(--text)",
                backgroundColor: isActive
                  ? "color-mix(in srgb, var(--accent-2) 12%, transparent)"
                  : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions + Mobile Trigger */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border text-sm transition-colors"
            aria-label="Toggle theme"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Desktop Auth Section */}
          {user ? (
            <>
              <span
                className="text-xs hidden md:inline"
                style={{ color: "var(--muted)" }}
              >
                {user.name || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  backgroundColor: "var(--card-bg)",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="hidden md:inline-flex px-2 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                style={{ color: "var(--text)" }}
              >
                Login
              </NavLink>
              <Link to="/register" className="hidden md:block">
                <Button variant="orange" className="text-sm py-1.5 px-3">
                  Register
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  d="M6 18L18 6M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6H21M3 12H21M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={({ isActive }: { isActive: boolean }) => ({
                  color: isActive ? "var(--accent-2)" : "var(--text)",
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--accent-2) 12%, transparent)"
                    : "transparent",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Auth Section */}
          <div
            className="border-t px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            {user ? (
              <>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                  {user.name || user.email}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block text-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="orange" className="w-full text-sm py-2">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
