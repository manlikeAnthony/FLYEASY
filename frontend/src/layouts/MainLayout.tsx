import { useEffect, useRef } from "react";
import api from "../services/api";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, LayoutDashboard, ListFilter, Plane, Search, ArrowUpRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const countedPath = useRef("");
  useEffect(() => {
    if (countedPath.current === pathname) return;
    countedPath.current = pathname;
    if (["/", "/book", "/login", "/register", "/track-request"].includes(pathname)) {
      api.post("/analytics/pageview", { path: pathname }).catch(() => { /* Analytics never blocks travel. */ });
    }
  }, [pathname]);
  const authPage = pathname === "/login" || pathname === "/register";
  const workspace = !!user && (/^\/(admin|my|requests|workspace|notifications)(\/|$)/.test(pathname));
  const admin = user?.role === "ADMIN";
  return <div className="app-shell"><a href="#main-content" className="skip-link">Skip to content</a>{!authPage && <Navbar/>}
    {workspace ? <div className="workspace-layout"><aside className="workspace-sidebar"><span className="eyebrow">{admin ? "OPERATIONS" : "YOUR TRAVEL SPACE"}</span>
      <NavLink to={admin ? "/admin" : "/my"} end><LayoutDashboard size={18}/>Overview</NavLink>
      {admin && <><NavLink to="/requests"><ListFilter size={18}/>Flight requests</NavLink><NavLink to="/admin/flights"><Search size={18}/>Find flights</NavLink></>}
      {!admin && <NavLink to="/my/new"><Plane size={18}/>New journey</NavLink>}
      <NavLink to="/notifications"><Bell size={18}/>Notifications</NavLink>
      <div className="sidebar-note"><span className="brand-icon"><Plane size={20}/></span><h3>{admin ? "Make every trip happen." : "A little help. A big adventure."}</h3><p>{admin ? "Your customers’ next chapter starts here." : "Your travel team is with you, every step of the way."}</p></div>
      <div className="workspace-profile"><span>{user?.name?.charAt(0) || "F"}</span><div><strong>{user?.name || "Traveler"}</strong><small>{admin ? "Administrator" : "Personal account"}</small></div></div>
    </aside><main id="main-content" className="workspace-main" key={pathname}>{children}</main></div> : <main id="main-content" className={authPage ? "auth-main" : pathname === "/" ? "home-main" : "page-main"} key={pathname}>{children}</main>}
    {!workspace && !authPage && <footer className="site-footer"><Link className="brand" to="/">flyeasy<span className="brand-dot">.</span></Link><p>A world of possibilities. A more personal way to fly.</p><Link to="/contact">Let’s talk about your next trip <ArrowUpRight size={16}/></Link><small>© {new Date().getFullYear()} FlyEasyNG. All rights reserved.</small></footer>}
  </div>;
}
