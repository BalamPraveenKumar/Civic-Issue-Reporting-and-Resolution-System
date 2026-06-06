import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "../pages/UserLogin";
import UserRegister from "../pages/UserRegister";
import AdminLogin from "../pages/AdminLogin";
import UserDashboard from "../pages/UserDashboard";
import CitizenFeed from "../pages/CitizenFeed";
import DistrictStats from "../pages/DistrictStats";
import Helpdesk from "../pages/Helpdesk";
import CitizenProfile from "../pages/CitizenProfile";
import Navbar from "../components/Navbar";

// Placeholder for admin dashboard (admin has its own separate Vite app at port 5174)
const AdminDashboardPlaceholder = () => (
  <div style={{ padding: "40px", maxWidth: "600px", margin: "40px auto", textAlign: "center", border: "1px dashed #d97706", borderRadius: "8px", backgroundColor: "#fffbeb" }}>
    <h2 style={{ color: "#92400e", marginBottom: "12px" }}>Admin Portal</h2>
    <p style={{ color: "#b45309", marginBottom: "16px" }}>
      The Admin dashboard runs as a separate application.
    </p>
    <a href="http://localhost:5174/admin/login" style={{ color: "#104f9e", fontWeight: "600", textDecoration: "underline" }}>
      Go to Admin Portal →
    </a>
  </div>
);

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Routes>
          {/* Default Route: Redirect to Citizen Login */}
          <Route path="/" element={<Navigate to="/user/login" replace />} />

          {/* Citizen Routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/feed" element={<CitizenFeed />} />
          <Route path="/user/analytics" element={<DistrictStats />} />
          <Route path="/user/help" element={<Helpdesk />} />
          <Route path="/user/profile" element={<CitizenProfile />} />

          {/* Admin / Official Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPlaceholder />} />

          {/* Fallback route: Redirect to User Login */}
          <Route path="*" element={<Navigate to="/user/login" replace />} />
        </Routes>
      </main>
    </>
  );
};

export default AppRoutes;
