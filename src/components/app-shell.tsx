"use client";

import { BriefcaseBusiness, LayoutDashboard, Menu, PanelLeftClose, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { RoleSwitcher } from "@/components/role-switcher";

function Brand() {
  return (
    <Link href="/dashboard" className="brand" aria-label="ServiceOps Desk dashboard">
      <span className="brand-mark" aria-hidden="true">
        <BriefcaseBusiness size={18} strokeWidth={2.2} />
      </span>
      <span>
        <strong>ServiceOps</strong>
        <small>Operations desk</small>
      </span>
    </Link>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const dashboardActive = pathname === "/dashboard";
  const jobsActive = pathname.startsWith("/jobs");

  return (
    <nav aria-label="Primary navigation" className="primary-nav">
      <p className="nav-label">Workspace</p>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={dashboardActive ? "nav-link nav-link-active" : "nav-link"}
        aria-current={dashboardActive ? "page" : undefined}
      >
        <LayoutDashboard size={17} aria-hidden="true" />
        Dashboard
      </Link>
      <Link
        href="/jobs"
        onClick={onNavigate}
        className={jobsActive ? "nav-link nav-link-active" : "nav-link"}
        aria-current={jobsActive ? "page" : undefined}
      >
        <PanelLeftClose size={17} aria-hidden="true" />
        Service jobs
      </Link>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;

    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
      if (event.key !== "Tab") return;

      const drawer = closeButtonRef.current?.closest("aside");
      const focusable = drawer?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [drawerOpen]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="desktop-sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar-note">
          <span className="sidebar-note-dot" aria-hidden="true" />
          Seeded demo workspace
        </div>
      </aside>

      {drawerOpen ? (
        <div className="drawer-layer" role="presentation">
          <button
            className="drawer-backdrop"
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="mobile-drawer"
            aria-label="Mobile navigation"
            aria-modal="true"
            role="dialog"
          >
            <div className="drawer-heading">
              <Brand />
              <button
                ref={closeButtonRef}
                className="icon-button"
                type="button"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <Navigation onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="app-column">
        <header className="top-bar">
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="top-context">
            <span>Bangkok office</span>
            <span className="top-status">
              <span aria-hidden="true" /> Demo online
            </span>
          </div>
          <RoleSwitcher />
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
