import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./ui/RootLayout";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UsersPage from "./pages/UsersPage";
import ListingsPage from "./pages/ListingsPage";
import VerificationsPage from "./pages/VerificationsPage";
import SettingsPage from "./pages/SettingsPage";

const isAuthed = () => localStorage.getItem("li_admin_auth") === "true";

function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "listings", element: <ListingsPage /> },
      { path: "verifications", element: <VerificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
