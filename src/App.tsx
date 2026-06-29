import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Seo } from "@/shared/components/Seo";
import { LoadingState } from "@/shared/components/ui/states";
import { LandingPage } from "@/public/pages/LandingPage";
import { BadgePage } from "@/public/pages/BadgePage";
import { CertificatePage } from "@/public/pages/CertificatePage";

const AdminLayout = lazy(() => import("@/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const DashboardPage = lazy(() => import("@/admin/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const ProgramsPage = lazy(() => import("@/admin/pages/ProgramsPage").then((m) => ({ default: m.ProgramsPage })));
const ProgramDetailsPage = lazy(() => import("@/admin/pages/ProgramDetailsPage").then((m) => ({ default: m.ProgramDetailsPage })));
const TemplatesPage = lazy(() => import("@/admin/pages/TemplatesPage").then((m) => ({ default: m.TemplatesPage })));
const GenerationsPage = lazy(() => import("@/admin/pages/GenerationsPage").then((m) => ({ default: m.GenerationsPage })));
const SettingsPage = lazy(() => import("@/admin/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f7fc]">
      <LoadingState label="Loading…" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f7fc] p-6 text-center">
      <Seo
        title="Page Not Found | Kids Coding Bootcamp"
        description="The requested Kids Coding Bootcamp page could not be found."
        path="/404"
        robots="noindex, nofollow"
      />
      <div>
        <p className="font-[Manrope] text-5xl font-extrabold text-slate-300">404</p>
        <p className="mt-2 text-sm font-bold text-slate-600">This page could not be found.</p>
        <a href="/" className="mt-4 inline-block rounded-xl bg-[#4267b2] px-4 py-2.5 text-xs font-bold text-white">Back to the bootcamp</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Public microsite — Kids Coding Bootcamp */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/badge" element={<BadgePage />} />
        <Route path="/certificate" element={<CertificatePage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/:id" element={<ProgramDetailsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="generations" element={<GenerationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
