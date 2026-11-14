import NotificationBell from "./NotificationBell";
import api from "../services/api";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowUpRight, Menu, Moon, Plane, Sun, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="nav-inner">
    <Link className="brand" to="/"><span className="brand-icon"><Plane size={22}/></span>flyeasy<span className="brand-dot">.</span><small>NG</small></Link>
    <nav aria-label="Main navigation" className={open ? "site-nav is-open" : "site-nav"} onClick={() => setOpen(false)}>
      <NavLink to="/" end>Discover</NavLink><NavLink to={user?"/my/new":"/book"}>Request a flight</NavLink><NavLink to="/track-request">Track request</NavLink><NavLink to="/contact">Contact us</NavLink>
      {user && <NavLink to={user.role === "ADMIN" ? "/admin" : "/my"}>My workspace</NavLink>}
    </nav>
    <div className="nav-actions"><NotificationBell/><button className="icon-button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
    {user ? <button className="nav-signin" onClick={async () => { try { await api.delete("/auth/logout"); clearAuth(); navigate("/login", { replace: true }); } catch { window.alert("Unable to sign out. Please try again."); } }}>Sign out</button> : <Link className="nav-signin" to="/login">Sign in <ArrowUpRight size={16}/></Link>}
    <button className="icon-button mobile-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
  </div></header>;
}
