import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "../pages/UserLogin";
import AdminLogin from "../pages/AdminLogin";
import Navbar from "../components/Navbar";

// Placeholder Dashboard Components to prove success flow navigation works
const UserDashboardPlaceholder = () => (
  <div style={{ padding: "40px", maxWidth: "600px", margin: "40px auto", textAlign: "center", border: "1px dashed #22c55e", borderRadius: "8px", backgroundColor: "#f0fdf4" }}>
    <h2 style={{ color: "#166534", marginBottom: "12px" }}>Citizen Dashboard Placeholder</h2>
    <p style={{ color: "#15803d" }}>Welcome, Citizen! Authentication was successful. This page is currently a placeholder for the reporting system dashboard.</p>
    <a href="/user/login" style={{ color: "#104f9e", fontWeight: "600", textDecoration: "underline" }}>Logout</a>
  </div>
);

const AdminDashboardPlaceholder = () => (
  <div style={{ padding: "40px", maxWidth: "600px", margin: "40px auto", textAlign: "center", border: "1px dashed #d97706", borderRadius: "8px", backgroundColor: "#fffbeb" }}>
    <h2 style={{ color: "#92400e", marginBottom: "12px" }}>Official Admin Dashboard Placeholder</h2>
    <p style={{ color: "#b45309" }}>Welcome, Officer! Authentication was successful. This page is currently a placeholder for the administrative monitoring dashboard.</p>
    <a href="/admin/login" style={{ color: "#104f9e", fontWeight: "600", textDecoration: "underline" }}>Logout</a>
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
          <Route path="/user/dashboard" element={<UserDashboardPlaceholder />} />

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
