import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Seo } from "@/shared/components/Seo";
import { LoadingState } from "@/shared/components/ui/states";
import { HomePage } from "@/public/pages/HomePage";
import { EventPage } from "@/public/pages/EventPage";
import { LandingPage } from "@/public/pages/LandingPage";
import { BadgePage } from "@/public/pages/BadgePage";
import { CertificatePage } from "@/public/pages/CertificatePage";

const AdminLoginPage = lazy(() => import("@/admin/pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })));
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
        title="Page Not Found | Digital Dreams Events"
        description="The requested page could not be found."
        path="/404"
        robots="noindex, nofollow"
      />
      <div>
        <p className="font-[Manrope] text-5xl font-extrabold text-slate-300">404</p>
        <p className="mt-2 text-sm font-bold text-slate-600">This page could not be found.</p>
        <a href="/" className="mt-4 inline-block rounded-xl bg-[#1b3a9e] px-4 py-2.5 text-xs font-bold text-white">Back home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Public portal — lists every Digital Dreams event */}
        <Route path="/" element={<HomePage />} />

        {/* Kids Coding Bootcamp — its own bespoke microsite */}
        <Route path="/events/kids-coding-bootcamp" element={<LandingPage />} />
        <Route path="/events/kids-coding-bootcamp/badge" element={<BadgePage />} />
        <Route path="/events/kids-coding-bootcamp/certificate" element={<CertificatePage />} />

        {/* Any other event — generic info page until it gets a bespoke one */}
        <Route path="/events/:slug" element={<EventPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
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
