import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Login from "./features/auth/Login";
import Onboarding from "./features/onboarding/Onboarding";
import Wardrobe from "./features/wardrobe/Wardrobe";
import TryOn from "./features/tryon/TryOn";
import TryOnResult from "./features/tryon/TryOnResult";
import TryOnStyled from "./features/tryon/TryOnStyled";
import Profile from "./features/profile/Profile";
import Home from "./features/home/Home";
import Wishlist from "./features/tryon/Wishlist";
import Recommendations from "./features/recommendations/Recommendations";
import Settings from "./features/profile/Settings";

function AppShell() {
  const location = useLocation();
  const isAuthPage = ["/", "/login"].includes(location.pathname);

  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({ wardrobe: true });

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100svh",
        overflow: "hidden",
        background: "var(--cream)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openSections={openSections}
        toggleSection={toggleSection}
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/wardrobe" element={<Wardrobe sidebar />} />
          <Route path="/tryon" element={<TryOn />} />
          <Route path="/tryon/result" element={<TryOnResult />} />
          <Route path="/tryon/result/styled" element={<TryOnStyled />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile" element={<Profile sidebar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
