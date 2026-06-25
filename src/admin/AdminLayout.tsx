import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarRange, FileStack, LayoutDashboard, LayoutTemplate, Menu, Settings, X } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { Seo } from "@/shared/components/Seo";
import { USE_MOCKS } from "@/shared/services/config";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/programs", label: "Programs", icon: CalendarRange, end: false },
  { to: "/admin/templates", label: "Templates", icon: LayoutTemplate, end: false },
  { to: "/admin/generations", label: "Generations", icon: FileStack, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? "bg-[#4267b2] text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f7fc] lg:flex">
      <Seo
        title="Admin | Attendance Generator"
        description="Private administration area for managing programs, templates and generated attendance badges."
        path="/admin"
        robots="noindex, nofollow"
      />
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <BrandMark />
        </div>
        <div className="px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Attendance Generator</p>
          <NavItems />
        </div>
        <div className="mt-auto p-4">
          <div className={`rounded-xl border p-3 text-[11px] font-semibold ${USE_MOCKS ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {USE_MOCKS ? "Mock data mode — backend not connected" : "Connected to live API"}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <BrandMark />
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600">
          <Menu size={18} />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <BrandMark />
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
