import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import IssuesManagement from "../pages/IssuesManagement";
import IssueDetails from "../pages/IssueDetails";
import Reports from "../pages/Reports";
import AdminLayout from "../layouts/AdminLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Admin Login Page */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes wrapped in AdminLayout */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
      
      <Route
        path="/admin/issues"
        element={
          <AdminLayout>
            <IssuesManagement />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/issues/:id"
        element={
          <AdminLayout>
            <IssueDetails />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminLayout>
            <Reports />
          </AdminLayout>
        }
      />

      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
