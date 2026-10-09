"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, CalendarDays, CheckSquare, ChevronDown, ClipboardCheck, LayoutDashboard, LogOut, Menu, UserRound, X, Bird } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/attendance", label: "Attendance", icon: Activity },
  { href: "/leaves", label: "Leave management", icon: CalendarDays },
  { href: "/tasks", label: "My tasks", icon: CheckSquare },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck, managerOnly: true },
  { href: "/profile", label: "My profile", icon: UserRound }
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  const visibleNav = nav.filter((item) => !item.managerOnly || user?.is_super_admin);

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Bird size={24} strokeWidth={2.2} /></div>
          <div><div className="brand-name">CROW<span>DESK</span></div><div className="brand-subtitle">Employee workspace</div></div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return <Link className={`nav-item ${active ? "nav-active" : ""}`} href={item.href} key={item.href}>
              <Icon size={19} strokeWidth={1.9} /><span>{item.label}</span>{active && <span className="nav-active-dot" />}
            </Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><div className="support-icon"><Bird size={17} /></div><div><strong>Make work flow.</strong><p>Your workday, in one place.</p></div></div>
          <div className="sidebar-foot">CROW.LK <span>•</span> EMPLOYEE PORTAL</div>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
      <main className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Crow Desk</span><span className="crumb-slash">/</span><strong>{nav.find((item) => item.href === pathname)?.label || "Workspace"}</strong></div>
          <div className="topbar-right">
            <div className="online-indicator"><span /> Workspace online</div>
            <div className="profile-menu-wrap">
              <button className="profile-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
                <span className="avatar">{(user?.employee?.preferred_name || user?.name || "C").slice(0, 1).toUpperCase()}</span>
                <span className="profile-trigger-text"><strong>{user?.employee?.preferred_name || user?.name || "Employee"}</strong><small>{user?.employee?.designation || user?.employee?.position || "Team member"}</small></span>
                <ChevronDown size={16} />
              </button>
              {menuOpen && <div className="profile-dropdown"><Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={16} /> My profile</Link><button onClick={signOut}><LogOut size={16} /> Sign out</button></div>}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
        <footer className="page-footer"><span>© {new Date().getFullYear()} Crow.lk</span><span>Built for better workdays <span className="footer-heart">✦</span></span></footer>
      </main>
    </div>
  );
}
