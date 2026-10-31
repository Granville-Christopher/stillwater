import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SiteChrome } from "./components.jsx";
import { HomePage, MissingPage } from "./pages/Home.jsx";
import { PropertyPage } from "./pages/Property.jsx";
import {
  PrequalCosts,
  PrequalDetails,
  PrequalDone,
  PrequalFunds,
  PrequalIntro,
  PrequalMonthly,
} from "./pages/Prequalify.jsx";
import { AdminPage } from "./pages/Admin.jsx";
import {
  ActivityPage,
  BalancePage,
  DashLayout,
  DocumentsPage,
  DownBalancePage,
  FundsPage,
  OverviewPage,
  PayPage,
  DashPropertyPage,
} from "./pages/Dashboard.jsx";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
      <Route element={<SiteChrome />}>
        <Route index element={<HomePage />} />
        <Route path="property" element={<PropertyPage />} />
        <Route path="prequalify" element={<PrequalIntro />} />
        <Route path="prequalify/costs" element={<PrequalCosts />} />
        <Route path="prequalify/funds" element={<PrequalFunds />} />
        <Route path="prequalify/monthly" element={<PrequalMonthly />} />
        <Route path="prequalify/details" element={<PrequalDetails />} />
        <Route path="prequalify/done" element={<PrequalDone />} />
        <Route path="*" element={<MissingPage />} />
      </Route>
      <Route path="admin" element={<AdminPage />} />
      <Route path="dashboard" element={<DashLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="property" element={<DashPropertyPage />} />
        <Route path="balance" element={<BalancePage />} />
        <Route path="pay" element={<PayPage />} />
        <Route path="funds" element={<FundsPage />} />
        <Route path="down-balance" element={<DownBalancePage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>
    </Routes>
    </>
  );
}
