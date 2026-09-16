"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../lib/auth";
import ChangePasswordDialog from "../../components/ui/ChangedPasswordDialog";
import { CRMUser } from "../../types";

const navItems = [
  {
    href: "/call-list",
    label: "Call List Queue",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    roles: ["developer", "panel_manager", "call_agent"],
  },
  {
    href: "/rules",
    label: "Anomaly Rules",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    roles: ["developer", "panel_manager"],
  },
  {
    href: "/tickets",
    label: "Field Tickets",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    roles: ["developer", "panel_manager"],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFC]">
        <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-[#5E6C84]">Loading Console Workstation...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handlePasswordChanged = (updatedUser: CRMUser) => {
    setUser(updatedUser);
  };

  const visibleNav = navItems.filter((item) => item.roles.includes(user.role));
  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : "CU";

  return (
    <div className="min-h-screen flex bg-[#FAFBFC] text-[#172B4D] font-sans selection:bg-[#DEEBFF] selection:text-[#0052CC]">

      {/* Force password change dialog on first login */}
      {user.mustChangePassword && (
        <ChangePasswordDialog onSuccess={handlePasswordChanged} />
      )}

      {/* Atlassian Sidebar */}
      <aside className="w-60 bg-white border-r border-[#DFE1E6] flex flex-col fixed h-full z-40 shadow-[1px_0_3px_rgba(9,30,66,0.04)]">

        {/* Sidebar Header */}
        <div className="px-5 py-4 border-b border-[#DFE1E6] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0052CC] rounded-[4px] flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#172B4D] truncate">CRM Portal</h1>
            <span className="inline-block text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC] px-2 py-0.2 rounded uppercase tracking-wider">
              {user.role.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#5E6C84]">
            Operations Workstation
          </div>
          {visibleNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-[4px] text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#DEEBFF] text-[#0052CC] shadow-xs"
                    : "text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#172B4D]"
                }`}
              >
                <span className={isActive ? "text-[#0052CC]" : "text-[#5E6C84]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-[#DFE1E6] bg-[#FAFBFC]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-[4px]">
            <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#172B4D] truncate">{user.name}</p>
              <p className="text-[10px] text-[#5E6C84] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-left px-3 py-1.5 text-xs font-semibold text-[#FF5630] hover:bg-[#FFEBE6] rounded-[4px] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-60 p-8 max-w-7xl">
        {children}
      </main>

    </div>
  );
}