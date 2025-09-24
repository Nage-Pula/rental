import React, { useState } from "react";
import AuthForm from "./components/AuthForm";
import DashboardPage from "./components/DashboardPage";
import UserApprovalDashboard from "./components/UserApprovalDashboard";
export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  function handleLoginSuccess(token, userRole) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    setLoggedIn(true);
    setRole(userRole);
  }
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setLoggedIn(false);
    setRole('');
  }

  // Decide which page to show:
  if (!loggedIn) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }
  // Show UserApprovalDashboard ONLY for master role
  if (role === "master") {
    return <UserApprovalDashboard onLogout={handleLogout} />;
  }
  // Admins and tenants see a personal dashboard
  return <DashboardPage role={role} onLogout={handleLogout} />;
}